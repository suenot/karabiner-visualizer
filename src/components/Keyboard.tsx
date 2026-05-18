import {
  KEYBOARD,
  KEY_UNIT,
  KEY_GAP,
  KEY_RADIUS,
  KEYBOARD_COLS,
  KEYBOARD_ROWS,
  type KeyDef,
} from "@/lib/keyboard-layout";

export type Highlight = {
  code: string;
  kind: "from" | "to";
};

const colors = {
  from: { fill: "#dc2626", text: "#fff", glow: "rgba(220,38,38,0.55)" },
  to: { fill: "#16a34a", text: "#fff", glow: "rgba(22,163,74,0.55)" },
  both: { fill: "#7c3aed", text: "#fff", glow: "rgba(124,58,237,0.55)" },
  idle: { fill: "#1f2937", text: "#e5e7eb", glow: "transparent" },
};

function highlightFor(code: string, highlights: Highlight[]) {
  const hits = highlights.filter((h) => h.code === code);
  if (hits.length === 0) return null;
  const kinds = new Set(hits.map((h) => h.kind));
  if (kinds.has("from") && kinds.has("to")) return "both";
  if (kinds.has("from")) return "from";
  return "to";
}

function Key({ k, highlight }: { k: KeyDef; highlight: keyof typeof colors }) {
  const w = (k.w ?? 1) * KEY_UNIT - KEY_GAP;
  const h = (k.h ?? 1) * KEY_UNIT - KEY_GAP;
  const x = k.x * KEY_UNIT + KEY_GAP / 2;
  const y = k.y * KEY_UNIT + KEY_GAP / 2;
  const c = colors[highlight];
  const showSub = k.sub && (k.w ?? 1) >= 1;
  return (
    <g style={{ filter: highlight !== "idle" ? `drop-shadow(0 0 6px ${c.glow})` : undefined }}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={KEY_RADIUS}
        fill={c.fill}
        stroke={highlight !== "idle" ? "#fff" : "#374151"}
        strokeWidth={highlight !== "idle" ? 1.5 : 1}
      />
      <text
        x={x + w / 2}
        y={showSub ? y + h / 2 - 2 : y + h / 2}
        fill={c.text}
        fontSize={k.label.length > 2 ? 11 : 16}
        fontFamily="ui-sans-serif, system-ui"
        fontWeight={600}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {k.label}
      </text>
      {showSub && (
        <text
          x={x + w / 2}
          y={y + h - 8}
          fill={highlight !== "idle" ? "rgba(255,255,255,0.85)" : "#9ca3af"}
          fontSize={8}
          fontFamily="ui-sans-serif, system-ui"
          textAnchor="middle"
        >
          {k.sub}
        </text>
      )}
    </g>
  );
}

export function Keyboard({ highlights }: { highlights: Highlight[] }) {
  const width = KEYBOARD_COLS * KEY_UNIT;
  const height = KEYBOARD_ROWS * KEY_UNIT;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label="Keyboard layout"
    >
      <rect width={width} height={height} fill="transparent" />
      {KEYBOARD.map((k) => {
        const hl = highlightFor(k.code, highlights);
        return <Key key={`${k.code}-${k.x}-${k.y}`} k={k} highlight={hl ?? "idle"} />;
      })}
    </svg>
  );
}
