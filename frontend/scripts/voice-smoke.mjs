/**
 * Smoke: mint ephemeral secret (if XAI_API_KEY set) and run a text turn.
 * Usage: npm run voice:smoke
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const p = path.join(root, ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

loadEnvLocal();

const key = process.env.XAI_API_KEY;
if (!key) {
  console.log("SKIP: XAI_API_KEY not set — token/WS smoke not run.");
  process.exit(0);
}

const t0 = Date.now();
const secretRes = await fetch("https://api.x.ai/v1/realtime/client_secrets", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ expires_after: { seconds: 300 } }),
});
const secretJson = await secretRes.json();
const token =
  secretJson.value ||
  secretJson.secret ||
  secretJson.token ||
  secretJson.client_secret?.value ||
  secretJson.client_secret;
if (!secretRes.ok || !token) {
  console.error("FAIL: client_secrets", secretRes.status, secretJson);
  process.exit(1);
}
console.log(`OK: ephemeral token minted in ${Date.now() - t0}ms`);

const url = "wss://api.x.ai/v1/realtime?model=grok-voice-latest";
await new Promise((resolve, reject) => {
  // Match browser auth: ephemeral token via sec-websocket-protocol.
  const ws = new WebSocket(url, [`xai-client-secret.${token}`]);
  const timer = setTimeout(() => {
    ws.close();
    reject(new Error("timeout waiting for response"));
  }, 25000);
  let saw = false;
  ws.addEventListener("open", () => {
    ws.send(
      JSON.stringify({
        type: "session.update",
        session: {
          voice: "eve",
          instructions: "Reply in one short sentence confirming voice smoke.",
          turn_detection: { type: "server_vad" },
          audio: {
            input: {
              format: { type: "audio/pcm", rate: 24000 },
              transcription: { model: "grok-transcribe" },
            },
            output: { format: { type: "audio/pcm", rate: 24000 } },
          },
        },
      })
    );
    ws.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: "Say hello in five words." }],
        },
      })
    );
    ws.send(JSON.stringify({ type: "response.create" }));
  });
  ws.addEventListener("message", (ev) => {
    const data = typeof ev.data === "string" ? ev.data : Buffer.from(ev.data).toString();
    const event = JSON.parse(data);
    if (
      event.type === "response.output_audio.delta" ||
      event.type === "response.output_audio_transcript.delta" ||
      event.type === "response.output_audio_transcript.done" ||
      event.type === "response.done"
    ) {
      saw = true;
      if (
        event.type === "response.done" ||
        event.type === "response.output_audio_transcript.done"
      ) {
        clearTimeout(timer);
        console.log("OK: text turn received", event.type);
        ws.close();
        resolve(null);
      }
    }
    if (event.type === "error") {
      clearTimeout(timer);
      reject(new Error(JSON.stringify(event)));
    }
  });
  ws.addEventListener("error", (e) => reject(e.error || e));
  ws.addEventListener("close", () => {
    clearTimeout(timer);
    if (saw) resolve(null);
  });
});

console.log("SMOKE PASS");
