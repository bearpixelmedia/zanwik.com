/** Dev-only voice session logger → POST /api/voice/log → .voice-logs/<id>.ndjson */

type LogData = Record<string, unknown>;

export type VoiceLogger = {
  sessionId: string;
  log: (kind: string, data?: LogData) => void;
  server: (event: Record<string, unknown>, extra?: LogData) => void;
  client: (event: Record<string, unknown>) => void;
  error: (where: string, err: unknown, extra?: LogData) => void;
  flush: (final?: boolean) => void;
  close: () => void;
};

const SINK = "/api/voice/log";
const AUDIO_TYPES = new Set([
  "response.output_audio.delta",
  "response.audio.delta",
  "input_audio_buffer.append",
]);

function enabled(): boolean {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return process.env.NEXT_PUBLIC_VOICE_LOG === "1";
  }
  return true;
}

function truncateString(s: string): string {
  if (s.length <= 400) return s;
  return `${s.slice(0, 400)}…[${s.length} chars]`;
}

function redactValue(value: unknown, depth: number): unknown {
  if (depth > 4) return "[depth]";
  if (typeof value === "string") return truncateString(value);
  if (Array.isArray(value)) {
    const sliced = value.slice(0, 50).map((v) => redactValue(v, depth + 1));
    if (value.length > 50) sliced.push(`[+${value.length - 50}]`);
    return sliced;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = redactValue(v, depth + 1);
    }
    return out;
  }
  return value;
}

function redactEvent(event: Record<string, unknown>): Record<string, unknown> {
  const type = String(event.type ?? "");
  if (AUDIO_TYPES.has(type)) {
    const payload = event.delta ?? event.audio;
    const bytes =
      typeof payload === "string"
        ? Math.floor((payload.length * 3) / 4)
        : undefined;
    return { type, bytes };
  }
  return redactValue(event, 0) as Record<string, unknown>;
}

export function createSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  }
  return Math.random().toString(16).slice(2, 10);
}

export function createVoiceLogger(sessionId: string): VoiceLogger {
  const buffer: LogData[] = [];
  const started = Date.now();
  let timer: ReturnType<typeof setTimeout> | null = null;
  const on = enabled();

  function scheduleFlush() {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      flush(false);
    }, 1000);
  }

  function log(kind: string, data: LogData = {}) {
    if (!on) return;
    const redacted = redactValue(data, 0);
    const entry: LogData = {
      ...(typeof redacted === "object" && redacted && !Array.isArray(redacted)
        ? (redacted as LogData)
        : { data: redacted }),
      t: Date.now() - started,
      ts: Date.now(),
      kind,
    };
    buffer.push(entry);
    if (typeof console !== "undefined" && process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[voice]", kind, data);
    }
    if (buffer.length >= 200) flush(false);
    else scheduleFlush();
  }

  function flush(final = false) {
    if (!on) return;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (!buffer.length) return;
    const entries = buffer.splice(0, buffer.length);
    try {
      const body = JSON.stringify({ sessionId, entries });
      if (final && typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(SINK, new Blob([body], { type: "application/json" }));
        return;
      }
      void fetch(SINK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: final,
      }).catch(() => {});
    } catch {
      /* logging must never throw into the voice path */
    }
  }

  return {
    sessionId,
    log,
    server(event, extra) {
      log("server", { ...redactEvent(event), ...extra });
    },
    client(event) {
      log("client", redactEvent(event));
    },
    error(where, err, extra) {
      const e = err as { name?: string; message?: string };
      log("error", {
        where,
        name: e?.name ?? "Error",
        message: truncateString(String(e?.message ?? err)),
        ...extra,
      });
    },
    flush,
    close() {
      flush(true);
    },
  };
}
