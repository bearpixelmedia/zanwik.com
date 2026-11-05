"use client";

/** Stroked Phosphor-style waveform (bold). Never use fill weight — blobs at 16px. */
export function WaveformIcon({
  size = 18,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 256 256"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M48 96v64M80 64v128M112 32v192M144 64v128M176 96v64M208 80v96"
        stroke="currentColor"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SendArrowIcon({
  size = 18,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 256 256"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M208 128L48 208l32-80L48 48l160 80Z"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Animated 4-bar waveform for live voice (skill: ~3px wide, 2px gap, 16px tall). */
export function LiveWaveformBars({
  phase,
  reducedMotion,
}: {
  phase: "connecting" | "listening" | "thinking" | "speaking";
  reducedMotion: boolean;
}) {
  const dim =
    phase === "connecting" || phase === "thinking" ? 0.75 : 1;
  const duration =
    phase === "speaking" ? "0.45s" : phase === "listening" ? "1.1s" : "1.6s";

  const scales = reducedMotion
    ? [0.7, 1, 0.85, 0.6]
    : [0.4, 1, 0.55, 0.85];

  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        gap: 2,
        height: 16,
        width: 18,
        opacity: dim,
      }}
    >
      {scales.map((s, i) => (
        <span
          key={i}
          style={{
            width: 3,
            height: 16,
            borderRadius: 1,
            background: "currentColor",
            transformOrigin: "bottom",
            transform: `scaleY(${s})`,
            animation: reducedMotion
              ? undefined
              : `zanwikVoiceBar ${duration} ease-in-out ${i * 0.12}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes zanwikVoiceBar {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </span>
  );
}
