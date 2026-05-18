import {
  LAYOUTS,
  KEY_UNIT,
  KEY_GAP,
  KEY_RADIUS,
  KEYBOARD_COLS,
  KEYBOARD_ROWS,
  type KeyDef,
  type Variant,
} from "@/lib/keyboard-layout";

export type Binding = {
  glyph: string;
  full: string;
  isShell?: boolean;
};

export type Bindings = Record<string, Binding>;

function isoEnterPath(k: KeyDef): string {
  // L-shape outline (clockwise) with rounded outer corners and a single
  // concave corner at the bottom-left notch.
  const r = KEY_RADIUS;
  const inset = KEY_GAP / 2;
  const x1 = k.x * KEY_UNIT + inset;                       // outer left
  const x2 = (k.x + (k.w ?? 1.5)) * KEY_UNIT - inset;       // outer right
  const x3 = (k.x + 0.25) * KEY_UNIT + inset;              // bottom-left of bottom segment
  const y1 = k.y * KEY_UNIT + inset;                       // top
  const y2 = (k.y + (k.h ?? 2)) * KEY_UNIT - inset;        // bottom
  const y3 = (k.y + 1) * KEY_UNIT - inset;                 // step line (concave corner y)

  return [
    `M ${x1 + r},${y1}`,
    `L ${x2 - r},${y1}`,
    `A ${r} ${r} 0 0 1 ${x2},${y1 + r}`,
    `L ${x2},${y2 - r}`,
    `A ${r} ${r} 0 0 1 ${x2 - r},${y2}`,
    `L ${x3 + r},${y2}`,
    `A ${r} ${r} 0 0 1 ${x3},${y2 - r}`,
    `L ${x3},${y3 + r}`,
    `A ${r} ${r} 0 0 0 ${x3 - r},${y3}`, // concave (sweep=0)
    `L ${x1 + r},${y3}`,
    `A ${r} ${r} 0 0 1 ${x1},${y3 - r}`,
    `L ${x1},${y1 + r}`,
    `A ${r} ${r} 0 0 1 ${x1 + r},${y1}`,
    "Z",
  ].join(" ");
}

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
      : "#52525b";

  if (k.shape === "iso_enter") {
    const d = isoEnterPath(k);
    // Place label in the centre of the bottom (wider) segment.
    const cx = (k.x + 0.25 + ((k.w ?? 1.5) - 0.25) / 2) * KEY_UNIT;
    const cy = (k.y + 1.5) * KEY_UNIT;
    const actionSize = 28;
    return (
      <g>
        <title>
          {remapped ? `${k.code} → ${binding!.full}` : `${k.code} (ISO L-shape)`}
        </title>
        <path
          d={d}
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
        <text
          x={cx}
          y={cy + actionSize * 0.35}
          fill="#e5e7eb"
          fontSize={actionSize}
          fontFamily="ui-sans-serif, system-ui"
          fontWeight={700}
          textAnchor="middle"
        >
          {remapped
            ? binding.glyph.length > 6
              ? binding.glyph.slice(0, 6) + "…"
              : binding.glyph
            : k.label}
        </text>
      </g>
    );
  }

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
          {k.label && (
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
          )}
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
        k.label && (
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
        )
      )}
    </g>
  );
}

export function Keyboard({
  bindings,
  activeModifiers,
  variant = "ansi",
}: {
  bindings: Bindings;
  activeModifiers: string[];
  variant?: Variant;
}) {
  const width = KEYBOARD_COLS * KEY_UNIT;
  const height = KEYBOARD_ROWS * KEY_UNIT;
  const modSet = new Set(activeModifiers);
  const layout = LAYOUTS[variant];
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label={`Keyboard layout (${variant.toUpperCase()})`}
    >
      <rect width={width} height={height} fill="transparent" />
      {layout.map((k, i) => (
        <Key
          key={`${k.code}-${k.x}-${k.y}-${i}`}
          k={k}
          binding={bindings[k.code]}
          modActive={modSet.has(k.code)}
        />
      ))}
    </svg>
  );
}
