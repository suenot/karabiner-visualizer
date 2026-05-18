import {
  KEYBOARD,
  KEY_UNIT,
  KEY_GAP,
  KEY_RADIUS,
  KEYBOARD_COLS,
  KEYBOARD_ROWS,
  type KeyDef,
} from "@/lib/keyboard-layout";

export type Binding = {
  /** What this key becomes when the active modifier is held. */
  glyph: string;
  /** Full textual description for tooltip. */
  full: string;
  /** True when output is a shell command. */
  isShell?: boolean;
};

export type Bindings = Record<string, Binding>;

function Key({
  k,
  binding,
  modActive,
}: {
  k: KeyDef;
  binding?: Binding;
  modActive: boolean;
}) {
  const w = (k.w ?? 1) * KEY_UNIT - KEY_GAP;
  const h = (k.h ?? 1) * KEY_UNIT - KEY_GAP;
  const x = k.x * KEY_UNIT + KEY_GAP / 2;
  const y = k.y * KEY_UNIT + KEY_GAP / 2;

  const remapped = !!binding;
  const fill = remapped
    ? binding.isShell
      ? "#92400e"
      : "#15803d"
    : modActive
      ? "#1e3a8a"
      : "#1f2937";
  const stroke = remapped
    ? "#86efac"
    : modActive
      ? "#93c5fd"
      : "#3f3f46";

  // Label sizes scale with key size.
  const nativeSize = Math.max(10, Math.min(14, h / 5.5));
  const actionSize = Math.max(14, Math.min(28, h / 2.2));

  return (
    <g>
      <title>
        {remapped
          ? `${k.code} → ${binding!.full}`
          : `${k.code}${k.sub ? " (" + k.sub + ")" : ""}`}
      </title>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={KEY_RADIUS}
        fill={fill}
        stroke={stroke}
        strokeWidth={remapped ? 1.5 : 1}
        style={
          remapped
            ? { filter: `drop-shadow(0 0 8px ${binding.isShell ? "rgba(245,158,11,0.55)" : "rgba(34,197,94,0.55)"})` }
            : modActive
              ? { filter: "drop-shadow(0 0 6px rgba(59,130,246,0.55))" }
              : undefined
        }
      />
      {remapped ? (
        <>
          {/* native key (top-left, dim) */}
          <text
            x={x + 8}
            y={y + 6 + nativeSize}
            fill="rgba(255,255,255,0.55)"
            fontSize={nativeSize}
            fontFamily="ui-sans-serif, system-ui"
            fontWeight={500}
          >
            {k.label}
          </text>
          {/* action label (center, bright) */}
          <text
            x={x + w / 2}
            y={y + h / 2 + actionSize * 0.35}
            fill="#fff"
            fontSize={actionSize}
            fontFamily="ui-sans-serif, system-ui"
            fontWeight={700}
            textAnchor="middle"
          >
            {binding.glyph.length > 6 ? binding.glyph.slice(0, 6) + "…" : binding.glyph}
          </text>
        </>
      ) : (
        <>
          <text
            x={x + w / 2}
            y={y + h / 2 + (k.sub ? -2 : actionSize * 0.05)}
            fill="#e5e7eb"
            fontSize={k.label.length > 2 ? Math.min(13, h / 3.5) : Math.min(20, h / 2.8)}
            fontFamily="ui-sans-serif, system-ui"
            fontWeight={600}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {k.label}
          </text>
          {k.sub && (
            <text
              x={x + w / 2}
              y={y + h - 8}
              fill="#9ca3af"
              fontSize={9}
              fontFamily="ui-sans-serif, system-ui"
              textAnchor="middle"
            >
              {k.sub}
            </text>
          )}
        </>
      )}
    </g>
  );
}

export function Keyboard({
  bindings,
  activeModifiers,
}: {
  bindings: Bindings;
  activeModifiers: string[];
}) {
  const width = KEYBOARD_COLS * KEY_UNIT;
  const height = KEYBOARD_ROWS * KEY_UNIT;
  const modSet = new Set(activeModifiers);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label="Keyboard layout"
    >
      <rect width={width} height={height} fill="transparent" />
      {KEYBOARD.map((k) => (
        <Key
          key={`${k.code}-${k.x}-${k.y}`}
          k={k}
          binding={bindings[k.code]}
          modActive={modSet.has(k.code)}
        />
      ))}
    </svg>
  );
}
