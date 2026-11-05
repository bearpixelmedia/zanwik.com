"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { PaperPlaneRight, Waveform } from "@phosphor-icons/react";
import {
  GrokVoiceSession,
  type VoicePhase,
} from "@/lib/voice/session";
import { LiveWaveformBars } from "./WaveformIcon";

const PLACEHOLDER: Record<Exclude<VoicePhase, "idle">, string> = {
  connecting: "Connecting…",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
};

function statusLabel(phase: VoicePhase, sessionId: string | null): string {
  if (phase === "idle") return "";
  const base = PLACEHOLDER[phase];
  return sessionId ? `${base.replace("…", "")} · session ${sessionId}` : base;
}

export function VoiceComposer({
  embed = false,
  onClose,
}: {
  embed?: boolean;
  onClose?: () => void;
}) {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<
    { role: "user" | "assistant"; text: string; id: string }[]
  >([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sessionRef = useRef<GrokVoiceSession | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const live = phase !== "idle";

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    return () => {
      void sessionRef.current?.stop("client");
    };
  }, []);

  const startVoice = useCallback(async () => {
    setError(null);
    const session = new GrokVoiceSession({
      onPhase: setPhase,
      onSessionId: setSessionId,
      onError: (message) => setError(message),
      onUserTranscript: (itemId, t) => {
        setTranscript((prev) => {
          const idx = prev.findIndex((r) => r.id === itemId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { role: "user", text: t || next[idx]!.text, id: itemId };
            return next;
          }
          return [...prev, { role: "user", text: t || "…", id: itemId }];
        });
      },
      onAssistantTranscript: (t) => {
        setTranscript((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            const next = [...prev];
            next[next.length - 1] = { ...last, text: t };
            return next;
          }
          return [
            ...prev,
            { role: "assistant", text: t, id: `a-${Date.now()}` },
          ];
        });
      },
    });
    sessionRef.current = session;
    await session.start();
  }, []);

  const stopVoice = useCallback(async () => {
    await sessionRef.current?.stop("client");
    sessionRef.current = null;
    setPhase("idle");
  }, []);

  const onPrimary = useCallback(async () => {
    const trimmed = text.trim();
    if (live) {
      if (trimmed) {
        sessionRef.current?.sendText(trimmed);
        setTranscript((prev) => [
          ...prev,
          { role: "user", text: trimmed, id: `t-${Date.now()}` },
        ]);
        setText("");
        return;
      }
      await stopVoice();
      return;
    }
    if (trimmed) {
      // Text without live session: start voice then send
      await startVoice();
      // small delay so WS can open; sendText no-ops until open — retry via effect
      const pending = trimmed;
      setText("");
      setTranscript((prev) => [
        ...prev,
        { role: "user", text: pending, id: `t-${Date.now()}` },
      ]);
      const trySend = () => {
        const s = sessionRef.current;
        if (s && s.getPhase() !== "idle" && s.getPhase() !== "connecting") {
          s.sendText(pending);
          return;
        }
        if (s) setTimeout(trySend, 120);
      };
      setTimeout(trySend, 120);
      return;
    }
    await startVoice();
  }, [live, text, startVoice, stopVoice]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void onPrimary();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void onPrimary();
    }
  };

  const placeholder = live
    ? PLACEHOLDER[phase as Exclude<VoicePhase, "idle">]
    : "Ask Zanwik about Ops Spec, Ops Check, or AI for your ops…";

  const showSend = text.trim().length > 0;
  const primaryLabel = live
    ? showSend
      ? "Send to voice session"
      : "End voice session"
    : showSend
      ? "Send"
      : "Start voice mode";

  return (
    <div
      className={embed ? "zanwik-voice-embed" : "zanwik-voice-panel"}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
        maxWidth: embed ? "100%" : 440,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        color: "#0f172a",
      }}
    >
      {!embed && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div>
            <div style={{ fontWeight: 650, fontSize: 15, letterSpacing: "-0.01em" }}>
              Talk to Zanwik
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              Ops Spec voice · Southeast mid-market AI
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={ghostBtn}
              aria-label="Close"
            >
              Close
            </button>
          )}
        </div>
      )}

      <div
        style={{
          minHeight: 120,
          maxHeight: 220,
          overflow: "auto",
          borderRadius: 12,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          padding: 12,
          fontSize: 13,
          lineHeight: 1.45,
        }}
        aria-live="polite"
      >
        {transcript.length === 0 ? (
          <p style={{ margin: 0, color: "#94a3b8" }}>
            Headphones recommended. Tap the waveform to talk — the mic icon is
            reserved for dictation elsewhere.
          </p>
        ) : (
          transcript.map((row) => (
            <p
              key={row.id}
              style={{
                margin: "0 0 8px",
                color: row.role === "user" ? "#0f172a" : "#334155",
              }}
            >
              <span style={{ fontWeight: 600, marginRight: 6 }}>
                {row.role === "user" ? "You" : "Zanwik"}
              </span>
              {row.text}
            </p>
          ))
        )}
      </div>

      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderRadius: 999,
          border: "1px solid #cbd5e1",
          background: "#fff",
          padding: "6px 6px 6px 14px",
          boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        }}
      >
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Message Zanwik"
          disabled={phase === "connecting"}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 14,
            minWidth: 0,
          }}
        />
        <span className="sr-only" role="status">
          {statusLabel(phase, sessionId)}
        </span>
        <button
          type="submit"
          aria-label={primaryLabel}
          title={primaryLabel}
          style={{
            ...primaryBtn,
            opacity: phase === "connecting" ? 0.7 : 1,
          }}
        >
          {live && !showSend ? (
            <LiveWaveformBars
              phase={phase as "connecting" | "listening" | "thinking" | "speaking"}
              reducedMotion={reducedMotion}
            />
          ) : showSend ? (
            <PaperPlaneRight size={18} weight="bold" />
          ) : (
            <Waveform size={18} weight="bold" />
          )}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          style={{ margin: 0, fontSize: 12, color: "#b91c1c" }}
        >
          {error}
        </p>
      )}

      {sessionId && live && (
        <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
          Session {sessionId}
        </p>
      )}
    </div>
  );
}

const primaryBtn: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  border: "none",
  background: "#0f172a",
  color: "#f8fafc",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flexShrink: 0,
};

const ghostBtn: CSSProperties = {
  border: "1px solid #e2e8f0",
  background: "#fff",
  borderRadius: 8,
  padding: "6px 10px",
  fontSize: 12,
  cursor: "pointer",
  color: "#475569",
};
