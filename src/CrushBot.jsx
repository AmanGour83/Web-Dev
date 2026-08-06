import React, { useState, useCallback, useRef } from "react";
import { Copy, Check, Sparkles, Heart, Flame, Cookie, Skull, HeartHandshake } from "lucide-react";

const NO_REPEAT_RULE =
  " Avoid the most overused, textbook pickup lines (e.g. anything about 'parking tickets', 'angels', 'falling from heaven', 'magnets') — those are the first thing everyone thinks of, so actively steer away from them and write something less predictable instead. Vary sentence structure and subject matter each time rather than reusing a template.";

const VIBES = [
  {
    id: "cute",
    label: "Cute",
    icon: Heart,
    gradient: "linear-gradient(135deg, #FF6FB0, #FF9ECF)",
    glow: "#FF6FB0",
    prompt:
      "Write ONE short, wholesome, sweet pickup line or compliment for a partner or crush. Warm, genuine, a little playful. Max 18 words. GenZ tone but not cringe. No quotation marks, no preamble, just the line." +
      NO_REPEAT_RULE,
  },
  {
    id: "savage",
    label: "Savage",
    icon: Flame,
    gradient: "linear-gradient(135deg, #FF3E3E, #FF8A3E)",
    glow: "#FF3E3E",
    prompt:
      "Write ONE short, confident, cheeky pickup line with a bit of savage/roast energy but still flirty and clearly complimentary underneath. Max 18 words. GenZ tone. No quotation marks, no preamble, just the line." +
      NO_REPEAT_RULE,
  },
  {
    id: "cheesy",
    label: "Cheesy",
    icon: Cookie,
    gradient: "linear-gradient(135deg, #FFC93E, #FF9E3E)",
    glow: "#FFC93E",
    prompt:
      "Write ONE deliberately cheesy, groan-worthy pickup line — the kind that's so bad it's funny and charming. Max 18 words. No quotation marks, no preamble, just the line." +
      NO_REPEAT_RULE,
  },
  {
    id: "genz",
    label: "GenZ Slang",
    icon: Skull,
    gradient: "linear-gradient(135deg, #7B2FF7, #25E5D3)",
    glow: "#7B2FF7",
    prompt:
      "Write ONE flirty compliment or pickup line using current GenZ internet slang (rizz, no cap, lowkey, ate, delulu, etc — pick 1-2 naturally, don't overstuff). Max 18 words. No quotation marks, no preamble, just the line." +
      NO_REPEAT_RULE,
  },
  {
    id: "apology",
    label: "Apology",
    icon: HeartHandshake,
    gradient: "linear-gradient(135deg, #4E7CFF, #7B2FF7)",
    glow: "#4E7CFF",
    prompt:
      "Write ONE short, genuine, heartfelt sorry message for a partner — sincere, warm, not overdramatic. Max 18 words. No quotation marks, no preamble, just the line." +
      NO_REPEAT_RULE,
  },
];

function Particle({ angle, distance, color, delay }) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * distance;
  const y = Math.sin(rad) * distance;
  return (
    <span
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 8px ${color}`,
        pointerEvents: "none",
        animation: `burst 700ms ease-out ${delay}ms forwards`,
        "--tx": `${x}px`,
        "--ty": `${y}px`,
      }}
    />
  );
}

export default function CrushBot() {
  const [vibeId, setVibeId] = useState("cute");
  const [line, setLine] = useState("");
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState(0);
  const [particles, setParticles] = useState([]);
  const [error, setError] = useState(false);
  const particleIdRef = useRef(0);
  const historyByVibeRef = useRef({}); // { [vibeId]: string[] }

  const vibe = VIBES.find((v) => v.id === vibeId);

  const spawnParticles = useCallback((color) => {
    const batch = Array.from({ length: 14 }).map(() => ({
      id: particleIdRef.current++,
      angle: Math.random() * 360,
      distance: 60 + Math.random() * 70,
      color,
      delay: Math.random() * 80,
    }));
    setParticles(batch);
    setTimeout(() => setParticles([]), 900);
  }, []);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(false);
    setFlipped(false);
    setCopied(false);

    // brief pause so the flip-back is visible before the new line lands
    await new Promise((r) => setTimeout(r, 220));

    try {
      const recentLines = historyByVibeRef.current[vibe.id] || [];
      const historyNote =
        recentLines.length > 0
          ? ` Lines already used for this vibe — do NOT repeat any of these or anything close to them in structure or wording: ${recentLines
              .map((l) => `"${l}"`)
              .join(" / ")}.`
          : "";

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: vibe.prompt + historyNote,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      const text = (data.content || [])
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("")
        .trim()
        .replace(/^["']|["']$/g, "");

      const finalLine = text || "Couldn't think of one... you're that speechless-inducing 😳";
      setLine(finalLine);

      if (text) {
        const updated = [...recentLines, text].slice(-8); // keep last 8 per vibe
        historyByVibeRef.current[vibe.id] = updated;
      }

      setCount((c) => c + 1);
      setFlipped(true);
      spawnParticles(vibe.glow);
    } catch (e) {
      setError(true);
      setLine(
        e.message && e.message !== "Failed to fetch"
          ? `Error: ${e.message}`
          : "Signal's down. Even AI needs a second to process how much rizz you have."
      );
      setFlipped(true);
    } finally {
      setLoading(false);
    }
  }, [vibe, spawnParticles]);

  const copyLine = useCallback(() => {
    if (!line) return;
    navigator.clipboard.writeText(line).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }, [line]);

  return (
    <div className="cb-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .cb-root {
          --bg: #0B0A1F;
          --bg2: #14112B;
          --card: rgba(255,255,255,0.06);
          --card-border: rgba(255,255,255,0.14);
          --text: #F5F3FF;
          --muted: #9C93B8;
          font-family: 'Inter', sans-serif;
          background:
            radial-gradient(circle at 15% 10%, rgba(123,47,247,0.25), transparent 45%),
            radial-gradient(circle at 85% 85%, rgba(255,62,157,0.2), transparent 45%),
            var(--bg);
          color: var(--text);
          min-height: 100vh;
          width: 100%;
          padding: 40px 20px 56px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-x: hidden;
        }

        .cb-eyebrow {
          font-size: 12px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
        }

        .cb-title {
          font-family: 'Fredoka', sans-serif;
          font-weight: 700;
          font-size: clamp(36px, 8vw, 64px);
          line-height: 1;
          margin: 0;
          text-align: center;
          background: linear-gradient(135deg, #FF6FB0, #7B2FF7 55%, #25E5D3);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: -0.01em;
        }

        .cb-sub {
          margin-top: 10px;
          color: var(--muted);
          font-size: clamp(14px, 2.4vw, 16px);
          text-align: center;
          max-width: 420px;
        }

        .cb-vibes {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin: 28px 0 34px;
          max-width: 560px;
        }

        .cb-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          border-radius: 999px;
          border: 1px solid var(--card-border);
          background: var(--card);
          color: var(--muted);
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: transform 160ms ease, color 160ms ease, border-color 160ms ease, background 160ms ease;
        }
        .cb-chip:hover { transform: translateY(-1px); }
        .cb-chip.active {
          color: #0B0A1F;
          border-color: transparent;
        }

        .cb-stage {
          perspective: 1400px;
          width: min(92vw, 380px);
          height: 480px;
          position: relative;
        }

        .cb-card {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
          transition: transform 620ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .cb-card.flipped { transform: rotateY(180deg); }

        .cb-face {
          position: absolute;
          inset: 0;
          border-radius: 26px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px;
          box-sizing: border-box;
          border: 1px solid var(--card-border);
          background: linear-gradient(160deg, #201C3D, #14112B);
          box-shadow: 0 20px 60px rgba(0,0,0,0.45);
        }

        .cb-face.back {
          transform: rotateY(180deg);
          text-align: center;
        }

        .cb-face-front::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 26px;
          padding: 1px;
          background: linear-gradient(120deg, rgba(255,111,176,0.5), rgba(123,47,247,0.5), rgba(37,229,211,0.5));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.7;
        }

        .cb-sparkle-icon { color: var(--muted); margin-bottom: 18px; opacity: 0.6; }

        .cb-instruction {
          font-family: 'Fredoka', sans-serif;
          font-weight: 600;
          font-size: 20px;
          text-align: center;
          color: var(--text);
        }
        .cb-instruction-sub {
          margin-top: 8px;
          color: var(--muted);
          font-size: 13px;
          text-align: center;
        }

        .cb-line {
          font-family: 'Fredoka', sans-serif;
          font-weight: 600;
          font-size: clamp(19px, 4.6vw, 24px);
          line-height: 1.35;
          text-align: center;
        }

        .cb-vibe-tag {
          position: absolute;
          top: 18px;
          left: 18px;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          font-weight: 600;
        }

        .cb-copy-btn {
          position: absolute;
          bottom: 18px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.08);
          border: 1px solid var(--card-border);
          color: var(--text);
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 160ms ease;
        }
        .cb-copy-btn:hover { background: rgba(255,255,255,0.15); }

        .cb-controls {
          margin-top: 34px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .cb-generate {
          font-family: 'Fredoka', sans-serif;
          font-weight: 600;
          font-size: 17px;
          color: #0B0A1F;
          border: none;
          border-radius: 999px;
          padding: 15px 38px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 30px -6px var(--glow, rgba(123,47,247,0.6));
          transition: transform 150ms ease, box-shadow 150ms ease, opacity 150ms ease;
        }
        .cb-generate:hover { transform: translateY(-2px) scale(1.02); }
        .cb-generate:active { transform: translateY(0) scale(0.98); }
        .cb-generate:disabled { opacity: 0.7; cursor: default; transform: none; }

        .cb-count {
          color: var(--muted);
          font-size: 13px;
        }
        .cb-count strong { color: var(--text); }

        .cb-footer {
          margin-top: 44px;
          color: var(--muted);
          font-size: 12px;
          letter-spacing: 0.04em;
          text-align: center;
        }

        @keyframes burst {
          from { opacity: 1; transform: translate(-50%, -50%) translate(0, 0) scale(1); }
          to { opacity: 0; transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(0.3); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .cb-spinner {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(11,10,31,0.3);
          border-top-color: #0B0A1F;
          animation: spin 700ms linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .cb-card, .cb-generate, .cb-chip { transition: none !important; }
        }
      `}</style>

      <div className="cb-eyebrow">
        <Sparkles size={13} /> synapse aiml club presents
      </div>
      <h1 className="cb-title">CrushBot</h1>
      <p className="cb-sub">Pick a vibe. Tap the card. Get a fresh AI-written line — never the same one twice.</p>

      <div className="cb-vibes">
        {VIBES.map((v) => {
          const Icon = v.icon;
          const active = v.id === vibeId;
          return (
            <button
              key={v.id}
              className={`cb-chip${active ? " active" : ""}`}
              style={active ? { background: v.gradient } : undefined}
              onClick={() => setVibeId(v.id)}
            >
              <Icon size={14} />
              {v.label}
            </button>
          );
        })}
      </div>

      <div className="cb-stage">
        <div className={`cb-card${flipped ? " flipped" : ""}`}>
          <div className="cb-face cb-face-front">
            <Sparkles size={34} className="cb-sparkle-icon" />
            <div className="cb-instruction">Tap generate to pull your line</div>
            <div className="cb-instruction-sub">{vibe.label} vibe selected</div>
          </div>
          <div className="cb-face back">
            <span className="cb-vibe-tag" style={{ color: vibe.glow }}>
              {vibe.label}
            </span>
            <p className="cb-line">{line}</p>
            {!error && (
              <button className="cb-copy-btn" onClick={copyLine}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy line"}
              </button>
            )}
          </div>
        </div>
        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}
      </div>

      <div className="cb-controls">
        <button
          className="cb-generate"
          style={{ background: vibe.gradient, "--glow": `${vibe.glow}66` }}
          onClick={generate}
          disabled={loading}
        >
          {loading ? <span className="cb-spinner" /> : <Sparkles size={16} />}
          {loading ? "Pulling your line..." : "Generate a line"}
        </button>
        <div className="cb-count">
          Lines generated: <strong>{count}</strong>
        </div>
      </div>

      <div className="cb-footer">Design. Create. Innovate. — Web Designing Competition 2026</div>
    </div>
  );
}
