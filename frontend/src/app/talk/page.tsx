import { VoiceComposer } from "@/components/voice/VoiceComposer";

export const metadata = {
  title: "Talk to Zanwik",
  description:
    "Voice conversation with Zanwik — Ops Spec guidance for Southeast mid-market operators.",
  robots: { index: false, follow: false },
};

export default function TalkPage({
  searchParams,
}: {
  searchParams?: { embed?: string };
}) {
  const embed = searchParams?.embed === "1";

  return (
    <main
      style={{
        minHeight: embed ? "100%" : "100vh",
        display: "flex",
        alignItems: embed ? "stretch" : "center",
        justifyContent: "center",
        padding: embed ? 12 : 24,
        background: embed
          ? "#fff"
          : "radial-gradient(1200px 600px at 10% -10%, #e2e8f0 0%, #f8fafc 45%, #f1f5f9 100%)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          borderRadius: embed ? 0 : 16,
          border: embed ? "none" : "1px solid #e2e8f0",
          padding: embed ? 4 : 20,
          boxShadow: embed ? "none" : "0 12px 40px rgba(15,23,42,0.08)",
        }}
      >
        <VoiceComposer embed={embed} />
      </div>
      <style>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        html, body { margin: 0; }
      `}</style>
    </main>
  );
}
