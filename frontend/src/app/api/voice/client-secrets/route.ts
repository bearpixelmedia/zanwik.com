import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM = "https://api.x.ai/v1/realtime/client_secrets";
const SESSION_ID_RE = /^[a-z0-9]{4,64}$/;

async function appendServerTokenLog(entry: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production" && process.env.VOICE_LOG !== "1") {
    return;
  }
  try {
    const dir = path.join(process.cwd(), ".voice-logs");
    await mkdir(dir, { recursive: true });
    const sessionId =
      typeof entry.sessionId === "string" && SESSION_ID_RE.test(entry.sessionId)
        ? entry.sessionId
        : "server";
    const line = JSON.stringify({
      ...entry,
      ts: Date.now(),
      kind: "server.token",
      src: "server",
    });
    await appendFile(path.join(dir, `${sessionId}.ndjson`), `${line}\n`);
  } catch {
    /* never break token minting for logging */
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    await appendServerTokenLog({
      ok: false,
      status: 503,
      ms: 0,
      upstream: "missing_XAI_API_KEY",
    });
    return NextResponse.json(
      {
        error:
          "XAI_API_KEY is not configured. Set it in the server environment (e.g. Vercel).",
      },
      { status: 503 }
    );
  }

  let clientSessionId: string | undefined;
  try {
    const body = (await req.json().catch(() => null)) as {
      sessionId?: string;
    } | null;
    if (body?.sessionId && SESSION_ID_RE.test(body.sessionId)) {
      clientSessionId = body.sessionId;
    }
  } catch {
    /* optional body */
  }

  const t0 = Date.now();
  try {
    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expires_after: { seconds: 300 } }),
    });
    const ms = Date.now() - t0;
    const text = await upstream.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text.slice(0, 200) };
    }

    await appendServerTokenLog({
      sessionId: clientSessionId,
      ok: upstream.ok,
      status: upstream.status,
      ms,
      upstream: "api.x.ai/v1/realtime/client_secrets",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: "Failed to mint ephemeral client secret",
          status: upstream.status,
        },
        { status: upstream.status === 401 ? 502 : upstream.status }
      );
    }

    return NextResponse.json(json);
  } catch (err) {
    await appendServerTokenLog({
      sessionId: clientSessionId,
      ok: false,
      status: 502,
      ms: Date.now() - t0,
      upstream: "fetch_error",
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json(
      { error: "Upstream voice token request failed" },
      { status: 502 }
    );
  }
}
