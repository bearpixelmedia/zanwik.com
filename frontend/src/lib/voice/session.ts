import { ZANWIK_VOICE_INSTRUCTIONS } from "./instructions";
import {
  createSessionId,
  createVoiceLogger,
  type VoiceLogger,
} from "./logger";
import {
  float32ToBase64Pcm16,
  resampleFloat32,
  TARGET_SAMPLE_RATE,
  base64ByteLength,
} from "./pcm";
import { PcmPlayer } from "./playback";

export type VoicePhase =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking";

export type VoiceSessionCallbacks = {
  onPhase?: (phase: VoicePhase) => void;
  onSessionId?: (id: string) => void;
  onError?: (message: string) => void;
  onUserTranscript?: (itemId: string, text: string, partial: boolean) => void;
  onAssistantTranscript?: (text: string, done: boolean) => void;
};

type EarlyChunk = Float32Array;

const WS_URL = "wss://api.x.ai/v1/realtime?model=grok-voice-latest";
const EARLY_CAP = 50;

function extractToken(payload: Record<string, unknown>): string | null {
  if (typeof payload.value === "string") return payload.value;
  if (typeof payload.secret === "string") return payload.secret;
  if (typeof payload.token === "string") return payload.token;
  if (typeof payload.client_secret === "string") return payload.client_secret;
  const nested = payload.client_secret;
  if (nested && typeof nested === "object") {
    const v = (nested as { value?: string }).value;
    if (typeof v === "string") return v;
  }
  return null;
}

export class GrokVoiceSession {
  private ws: WebSocket | null = null;
  private ctx: AudioContext | null = null;
  private player: PcmPlayer | null = null;
  private worklet: AudioWorkletNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private logger: VoiceLogger | null = null;
  private phase: VoicePhase = "idle";
  private early: EarlyChunk[] = [];
  private open = false;
  private stopped = false;
  private assistantBuf = "";
  private createdT = 0;
  private speechStoppedT = 0;
  private firstAudioLogged = false;
  private audioInWindow = {
    t0: 0,
    chunks: 0,
    bytes: 0,
    rmsSum: 0,
    rmsMax: 0,
  };
  private responseAudio = {
    deltas: 0,
    bytes: 0,
    responseId: "",
  };

  constructor(private cb: VoiceSessionCallbacks = {}) {}

  getPhase() {
    return this.phase;
  }

  getSessionId() {
    return this.logger?.sessionId ?? null;
  }

  async start() {
    if (this.phase !== "idle") return;
    this.stopped = false;
    const sessionId = createSessionId();
    this.logger = createVoiceLogger(sessionId);
    this.cb.onSessionId?.(sessionId);
    this.setPhase("connecting");

    const tokenT0 = performance.now();
    this.logger.log("start", { url: WS_URL, target_rate: TARGET_SAMPLE_RATE });

    let token: string;
    try {
      const res = await fetch("/api/voice/client-secrets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const ms = Math.round(performance.now() - tokenT0);
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        this.logger.error("token", new Error(`HTTP ${res.status}`), {
          ms,
          status: res.status,
          body: body.slice(0, 200),
        });
        throw new Error(
          `Could not mint voice token (${res.status}) (voice session ${sessionId})`
        );
      }
      const json = (await res.json()) as Record<string, unknown>;
      const extracted = extractToken(json);
      if (!extracted) {
        this.logger.error("token", new Error("missing token field"), { ms });
        throw new Error(
          `Voice token response missing secret (voice session ${sessionId})`
        );
      }
      token = extracted;
      this.logger.log("token.ok", { ms });
    } catch (err) {
      this.fail(err);
      return;
    }

    // One AudioContext for capture + playback, created in the user gesture.
    const ctx = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE });
    this.ctx = ctx;
    if (ctx.state === "suspended") await ctx.resume();
    this.player = new PcmPlayer(ctx);

    const micT0 = performance.now();
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      });
      const track = this.mediaStream.getAudioTracks()[0];
      const settings = track?.getSettings?.() ?? {};
      this.logger.log("mic.ok", {
        ms: Math.round(performance.now() - micT0),
        label: track?.label ?? "",
        settings,
      });
    } catch (err) {
      this.logger.error("mic", err, {
        ms: Math.round(performance.now() - micT0),
      });
      this.fail(err);
      return;
    }

    try {
      await ctx.audioWorklet.addModule("/voice/pcm-capture-processor.js");
    } catch (err) {
      this.logger.error("worklet", err);
      this.fail(err);
      return;
    }

    this.sourceNode = ctx.createMediaStreamSource(this.mediaStream);
    this.worklet = new AudioWorkletNode(ctx, "pcm-capture");
    this.worklet.port.onmessage = (ev: MessageEvent<Float32Array>) => {
      this.onMicChunk(ev.data);
    };
    this.sourceNode.connect(this.worklet);
    // Do not connect worklet to destination (would echo).

    this.logger.log("env", {
      ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
      mic_rate: ctx.sampleRate,
      mic_state: ctx.state,
      play_rate: ctx.sampleRate,
      play_state: ctx.state,
      capture_frames: Math.round(ctx.sampleRate * 0.1),
      target_rate: TARGET_SAMPLE_RATE,
    });

    const wsT0 = performance.now();
    this.logger.log("ws.connecting", {});
    const ws = new WebSocket(WS_URL, [`xai-client-secret.${token}`]);
    this.ws = ws;

    ws.addEventListener("open", () => {
      this.open = true;
      this.logger?.log("ws.open", { ms: Math.round(performance.now() - wsT0) });
      const sessionUpdate = {
        type: "session.update",
        session: {
          voice: "eve",
          instructions: ZANWIK_VOICE_INSTRUCTIONS,
          turn_detection: { type: "server_vad" },
          audio: {
            input: {
              format: { type: "audio/pcm", rate: TARGET_SAMPLE_RATE },
              transcription: { model: "grok-transcribe" },
            },
            output: {
              format: { type: "audio/pcm", rate: TARGET_SAMPLE_RATE },
            },
          },
        },
      };
      this.send(sessionUpdate);
      this.flushEarly();
      this.setPhase("listening");
    });

    ws.addEventListener("message", (ev) => {
      this.onServerMessage(String(ev.data));
    });

    ws.addEventListener("error", () => {
      this.logger?.log("ws.error", {});
    });

    ws.addEventListener("close", (ev) => {
      this.logger?.log("ws.close", {
        code: ev.code,
        reason: ev.reason,
        wasClean: ev.wasClean,
        by: this.stopped ? "client" : "server",
      });
      if (!this.stopped) {
        this.cb.onError?.(
          `Voice connection closed (${ev.code}) (voice session ${sessionId})`
        );
        void this.stop("server");
      }
    });
  }

  /** Send typed text into the live session (or no-op if not open). */
  sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.send({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: trimmed }],
      },
    });
    this.send({ type: "response.create" });
    this.setPhase("thinking");
  }

  async stop(by: "client" | "server" = "client") {
    if (this.stopped && by === "client") return;
    this.stopped = true;
    this.logger?.log("stop", { by, phase: this.phase });
    this.flushAudioIn(true);
    this.player?.stopAll("stop");

    try {
      this.worklet?.port.close();
      this.worklet?.disconnect();
    } catch {
      /* ignore */
    }
    try {
      this.sourceNode?.disconnect();
    } catch {
      /* ignore */
    }
    this.mediaStream?.getTracks().forEach((t) => t.stop());
    if (this.ws && this.ws.readyState <= WebSocket.OPEN) {
      try {
        this.ws.close();
      } catch {
        /* ignore */
      }
    }
    if (this.ctx && this.ctx.state !== "closed") {
      try {
        await this.ctx.close();
      } catch {
        /* ignore */
      }
    }
    this.logger?.close();
    this.ws = null;
    this.ctx = null;
    this.player = null;
    this.worklet = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.open = false;
    this.early = [];
    this.setPhase("idle");
  }

  private fail(err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Voice session failed";
    const id = this.logger?.sessionId;
    this.cb.onError?.(
      id && !msg.includes("voice session")
        ? `${msg} (voice session ${id})`
        : msg
    );
    void this.stop("client");
  }

  private setPhase(phase: VoicePhase) {
    if (this.phase === phase) return;
    this.phase = phase;
    this.logger?.log("phase", { phase });
    this.cb.onPhase?.(phase);
  }

  private send(event: Record<string, unknown>) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    if (event.type !== "input_audio_buffer.append") {
      this.logger?.client(event);
    }
    this.ws.send(JSON.stringify(event));
  }

  private onMicChunk(float32: Float32Array) {
    if (this.stopped) return;
    const ctxRate = this.ctx?.sampleRate ?? TARGET_SAMPLE_RATE;
    const resampled =
      ctxRate === TARGET_SAMPLE_RATE
        ? float32
        : resampleFloat32(float32, ctxRate, TARGET_SAMPLE_RATE);

    let rms = 0;
    for (let i = 0; i < resampled.length; i++) {
      const v = resampled[i]!;
      rms += v * v;
    }
    rms = Math.sqrt(rms / Math.max(1, resampled.length));
    this.noteAudioIn(resampled.length * 2, rms);

    if (!this.open) {
      if (this.early.length < EARLY_CAP) this.early.push(resampled);
      return;
    }
    this.appendPcm(resampled);
  }

  private appendPcm(float32: Float32Array) {
    const b64 = float32ToBase64Pcm16(float32);
    this.ws?.send(
      JSON.stringify({ type: "input_audio_buffer.append", audio: b64 })
    );
  }

  private flushEarly() {
    if (!this.early.length) return;
    this.logger?.log("audio.flush", { chunks: this.early.length });
    for (const chunk of this.early) this.appendPcm(chunk);
    this.early = [];
  }

  private noteAudioIn(bytes: number, rms: number) {
    const now = performance.now();
    if (!this.audioInWindow.t0) this.audioInWindow.t0 = now;
    this.audioInWindow.chunks += 1;
    this.audioInWindow.bytes += bytes;
    this.audioInWindow.rmsSum += rms;
    if (rms > this.audioInWindow.rmsMax) this.audioInWindow.rmsMax = rms;
    if (now - this.audioInWindow.t0 >= 2000) this.flushAudioIn(false);
  }

  private flushAudioIn(force: boolean) {
    const w = this.audioInWindow;
    if (!w.t0) return;
    if (!force && performance.now() - w.t0 < 2000) return;
    this.logger?.log("audio.in", {
      chunks: w.chunks,
      bytes: w.bytes,
      rms_max: Number(w.rmsMax.toFixed(4)),
      rms_avg: Number((w.rmsSum / Math.max(1, w.chunks)).toFixed(4)),
      pending: this.early.length,
      mic_state: this.ctx?.state,
      phase: this.phase,
    });
    this.audioInWindow = {
      t0: force ? 0 : performance.now(),
      chunks: 0,
      bytes: 0,
      rmsSum: 0,
      rmsMax: 0,
    };
  }

  private onServerMessage(raw: string) {
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return;
    }
    const type = String(event.type ?? "");

    if (
      type === "response.output_audio.delta" ||
      type === "response.audio.delta"
    ) {
      this.onAudioDelta(event);
      return;
    }

    this.logger?.server(event, { phase: this.phase });

    switch (type) {
      case "input_audio_buffer.speech_started": {
        const dropped = this.player?.stopAll("speech_started") ?? 0;
        this.logger?.log("play.stop", {
          reason: "speech_started",
          dropped_ms: Math.round(dropped),
        });
        this.setPhase("listening");
        break;
      }
      case "input_audio_buffer.speech_stopped":
        this.speechStoppedT = performance.now();
        this.setPhase("thinking");
        break;
      case "input_audio_buffer.committed": {
        const itemId = String(event.item_id ?? "");
        if (itemId) this.cb.onUserTranscript?.(itemId, "", true);
        break;
      }
      case "conversation.item.input_audio_transcription.updated": {
        const itemId = String(event.item_id ?? "");
        const transcript = String(event.transcript ?? "");
        if (itemId) this.cb.onUserTranscript?.(itemId, transcript, true);
        break;
      }
      case "response.created":
        this.createdT = performance.now();
        this.firstAudioLogged = false;
        this.assistantBuf = "";
        this.responseAudio = {
          deltas: 0,
          bytes: 0,
          responseId: String(
            (event.response as { id?: string } | undefined)?.id ??
              event.response_id ??
              ""
          ),
        };
        this.player?.resetTurn();
        this.setPhase("thinking");
        break;
      case "response.output_audio_transcript.delta": {
        const delta = String(event.delta ?? "");
        this.assistantBuf += delta;
        this.cb.onAssistantTranscript?.(this.assistantBuf, false);
        this.setPhase("speaking");
        break;
      }
      case "response.output_audio_transcript.done": {
        const text = String(event.transcript ?? this.assistantBuf);
        this.assistantBuf = text;
        this.cb.onAssistantTranscript?.(text, true);
        break;
      }
      case "response.done": {
        const status = String(
          (event.response as { status?: string } | undefined)?.status ??
            event.status ??
            ""
        );
        const st = this.player?.stats;
        this.logger?.log("audio.out", {
          response_id: this.responseAudio.responseId,
          status,
          deltas: this.responseAudio.deltas,
          bytes: this.responseAudio.bytes,
          audio_ms: st
            ? Math.round((st.bytes / 2 / TARGET_SAMPLE_RATE) * 1000)
            : 0,
          wall_ms: this.createdT
            ? Math.round(performance.now() - this.createdT)
            : 0,
          max_gap_ms: st?.maxGapMs ?? 0,
          queued_ms: st?.queuedMs ?? 0,
          underruns: st?.underruns ?? 0,
          drain_ms_max: st?.drainMsMax ?? 0,
        });
        this.player?.endResponse();
        this.setPhase("listening");
        break;
      }
      case "error": {
        const message = String(
          (event.error as { message?: string } | undefined)?.message ??
            event.message ??
            "server error"
        );
        this.logger?.error("server", new Error(message));
        this.cb.onError?.(
          `${message} (voice session ${this.logger?.sessionId ?? "?"})`
        );
        break;
      }
      default:
        break;
    }
  }

  private onAudioDelta(event: Record<string, unknown>) {
    const delta = String(event.delta ?? event.audio ?? "");
    if (!delta || !this.player) return;
    const bytes = base64ByteLength(delta);
    this.responseAudio.deltas += 1;
    this.responseAudio.bytes += bytes;

    if (!this.firstAudioLogged) {
      this.firstAudioLogged = true;
      this.logger?.log("audio.out.first", {
        response_id: this.responseAudio.responseId,
        bytes,
        since_response_created_ms: this.createdT
          ? Math.round(performance.now() - this.createdT)
          : 0,
        since_speech_stopped_ms: this.speechStoppedT
          ? Math.round(performance.now() - this.speechStoppedT)
          : 0,
        play_state: this.ctx?.state,
      });
    }

    this.player.enqueueBase64Pcm16(delta);
    this.setPhase("speaking");
  }
}
