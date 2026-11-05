/**
 * Summarize a .voice-logs/<id>.ndjson file.
 * Usage: npm run voice:logs -- <sessionId>
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const id = process.argv[2];
if (!id) {
  console.error("Usage: npm run voice:logs -- <sessionId>");
  process.exit(1);
}
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, ".voice-logs", `${id}.ndjson`);
if (!existsSync(file)) {
  console.error("Missing", file);
  process.exit(1);
}

const lines = readFileSync(file, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  })
  .filter(Boolean);

const milestones = new Set([
  "start",
  "token.ok",
  "mic.ok",
  "env",
  "ws.open",
  "ws.close",
  "server.token",
  "stop",
  "error",
  "phase",
  "audio.out.first",
  "audio.out",
]);
console.log("## Milestones");
for (const e of lines.filter((x) => milestones.has(x.kind))) {
  console.log(
    `${e.t ?? e.ts}ms ${e.kind} ${e.type ?? ""} ${e.message ?? e.phase ?? ""}`.trim()
  );
}
const serverTypes = {};
for (const e of lines.filter((x) => x.kind === "server")) {
  serverTypes[e.type] = (serverTypes[e.type] || 0) + 1;
}
console.log("\n## Server event counts");
for (const [t, n] of Object.entries(serverTypes).sort((a, b) => b[1] - a[1])) {
  console.log(`${n}\t${t}`);
}
console.log("\n## Last 25");
for (const e of lines.slice(-25)) {
  console.log(JSON.stringify(e));
}
