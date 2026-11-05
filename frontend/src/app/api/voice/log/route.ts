import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_ID_RE = /^[a-z0-9]{4,64}$/;
const MAX_ENTRIES = 500;
const MAX_LINE = 16000;

export async function POST(req: Request) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.VOICE_LOG !== "1"
  ) {
    return new NextResponse(null, { status: 404 });
  }

  let body: { sessionId?: unknown; entries?: unknown };
  try {
    body = (await req.json()) as { sessionId?: unknown; entries?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const sessionId = body.sessionId;
  if (typeof sessionId !== "string" || !SESSION_ID_RE.test(sessionId)) {
    return NextResponse.json({ error: "invalid sessionId" }, { status: 400 });
  }
  if (!Array.isArray(body.entries)) {
    return NextResponse.json({ error: "entries must be array" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), ".voice-logs");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${sessionId}.ndjson`);

  const lines: string[] = [];
  for (const entry of body.entries.slice(0, MAX_ENTRIES)) {
    try {
      const line = JSON.stringify(entry);
      if (line.length <= MAX_LINE) lines.push(line);
    } catch {
      /* drop */
    }
  }
  if (lines.length) {
    await appendFile(file, `${lines.join("\n")}\n`);
  }

  return new NextResponse(null, { status: 204 });
}
