export type KeyDef = {
  code: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  shape?: "iso_enter";
};

export type Variant = "ansi" | "iso";

export const KEY_UNIT = 72;
export const KEY_GAP = 5;
export const KEY_RADIUS = 9;

type RowItem =
  | string
  | { code: string; label?: string; sub?: string; w?: number };
type Row = { y: number; items: RowItem[] };

const labelMap: Record<string, { label: string; sub?: string }> = {
  grave_accent_and_tilde: { label: "`", sub: "~" },
  hyphen: { label: "-", sub: "_" },
  equal_sign: { label: "=", sub: "+" },
  open_bracket: { label: "[", sub: "{" },
  close_bracket: { label: "]", sub: "}" },
  backslash: { label: "\\", sub: "|" },
  semicolon: { label: ";", sub: ":" },
  quote: { label: "'", sub: '"' },
  comma: { label: ",", sub: "<" },
  period: { label: ".", sub: ">" },
  slash: { label: "/", sub: "?" },
  non_us_backslash: { label: "§", sub: "±" },
  non_us_pound: { label: "#", sub: "~" },
  delete_or_backspace: { label: "⌫" },
  return_or_enter: { label: "return" },
  tab: { label: "tab" },
  caps_lock: { label: "caps" },
  left_shift: { label: "shift" },
  right_shift: { label: "shift" },
  left_control: { label: "ctrl" },
  right_control: { label: "ctrl" },
  left_option: { label: "option" },
  right_option: { label: "option" },
  left_command: { label: "⌘", sub: "cmd" },
  right_command: { label: "⌘", sub: "cmd" },
  spacebar: { label: " " },
  escape: { label: "esc" },
  fn: { label: "fn" },
  left_arrow: { label: "◀" },
  right_arrow: { label: "▶" },
  up_arrow: { label: "▲" },
  down_arrow: { label: "▼" },
};

function expand(rows: Row[]): KeyDef[] {
  const out: KeyDef[] = [];
  for (const row of rows) {
    let x = 0;
    for (const item of row.items) {
      const code = typeof item === "string" ? item : item.code;
      const w = typeof item === "string" ? 1 : item.w ?? 1;
      const meta = labelMap[code];
      const explicitLabel = typeof item === "object" ? item.label : undefined;
      const explicitSub = typeof item === "object" ? item.sub : undefined;
      out.push({
        code,
        label: explicitLabel ?? meta?.label ?? code.toUpperCase(),
        sub: explicitSub ?? meta?.sub,
        x,
        y: row.y,
        w,
        h: 1,
      });
      x += w;
    }
  }
  return out;
}

const fnRow: Row = {
  y: 0,
  items: [
    { code: "escape", w: 1.25 },
    { code: "f1", w: 1.145 },
    { code: "f2", w: 1.145 },
    { code: "f3", w: 1.145 },
    { code: "f4", w: 1.145 },
    { code: "f5", w: 1.145 },
    { code: "f6", w: 1.145 },
    { code: "f7", w: 1.145 },
    { code: "f8", w: 1.145 },
    { code: "f9", w: 1.145 },
    { code: "f10", w: 1.145 },
    { code: "f11", w: 1.145 },
    { code: "f12", w: 1.145 },
  ],
};

const bottomRow: Row = {
  y: 5,
  items: [
    { code: "fn", w: 1 },
    { code: "left_control", w: 1 },
    { code: "left_option", w: 1 },
    { code: "left_command", w: 1.25 },
    { code: "spacebar", w: 5.5 },
    { code: "right_command", w: 1.25 },
    { code: "right_option", w: 1 },
    { code: "left_arrow", w: 1 },
  ],
};

const ansiRows: Row[] = [
  fnRow,
  // Digits 15U
  {
    y: 1,
    items: [
      "grave_accent_and_tilde",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "0",
      "hyphen",
      "equal_sign",
      { code: "delete_or_backspace", w: 2 },
    ],
  },
  // QWERTY 15U
  {
    y: 2,
    items: [
      { code: "tab", w: 1.5 },
      "q",
      "w",
      "e",
      "r",
      "t",
      "y",
      "u",
      "i",
      "o",
      "p",
      "open_bracket",
      "close_bracket",
      { code: "backslash", w: 1.5 },
    ],
  },
  // ASDF 15U
  {
    y: 3,
    items: [
      { code: "caps_lock", w: 1.75 },
      "a",
      "s",
      "d",
      "f",
      "g",
      "h",
      "j",
      "k",
      "l",
      "semicolon",
      "quote",
      { code: "return_or_enter", w: 2.25 },
    ],
  },
  // ZXCV 15U
  {
    y: 4,
    items: [
      { code: "left_shift", w: 2.25 },
      "z",
      "x",
      "c",
      "v",
      "b",
      "n",
      "m",
      "comma",
      "period",
      "slash",
      { code: "right_shift", w: 2.75 },
    ],
  },
  bottomRow,
];

// ISO MacBook (Apple ISO):
// - Number row: leftmost is non_us_backslash (§/±) instead of grave
// - QWERTY row ends at ] (no backslash on right; the slot is replaced by tall enter)
// - ASDF row: caps(1.75) + 11 keys + narrow backslash(1) + narrow return(1.25)
//   Visually we draw enter as a tall 1.25U key sitting in rows 2&3 (here split into
//   two stacked cells for simplicity).
// - ZXCV row: left_shift narrows to 1.25U, then extra grave_accent_and_tilde (1U), then ZXCVBNM,./ rshift
const isoRows: Row[] = [
  fnRow,
  {
    y: 1,
    items: [
      { code: "non_us_backslash" },
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "0",
      "hyphen",
      "equal_sign",
      { code: "delete_or_backspace", w: 2 },
    ],
  },
  {
    y: 2,
    items: [
      { code: "tab", w: 1.5 },
      "q",
      "w",
      "e",
      "r",
      "t",
      "y",
      "u",
      "i",
      "o",
      "p",
      "open_bracket",
      "close_bracket",
    ],
  },
  {
    y: 3,
    items: [
      { code: "caps_lock", w: 1.75 },
      "a",
      "s",
      "d",
      "f",
      "g",
      "h",
      "j",
      "k",
      "l",
      "semicolon",
      "quote",
      { code: "backslash" },
    ],
  },
  {
    y: 4,
    items: [
      { code: "left_shift", w: 1.25 },
      { code: "grave_accent_and_tilde" },
      "z",
      "x",
      "c",
      "v",
      "b",
      "n",
      "m",
      "comma",
      "period",
      "slash",
      { code: "right_shift", w: 2.75 },
    ],
  },
  bottomRow,
];

function arrows(rowMaxX: number): KeyDef[] {
  return [
    { code: "up_arrow", label: "▲", x: rowMaxX, y: 5, w: 1, h: 0.5 },
    { code: "down_arrow", label: "▼", x: rowMaxX, y: 5.5, w: 1, h: 0.5 },
    { code: "right_arrow", label: "▶", x: rowMaxX + 1, y: 5, w: 1, h: 1 },
  ];
}

function buildLayout(variant: Variant): KeyDef[] {
  const main = expand(variant === "iso" ? isoRows : ansiRows);
  const lastBottom = main
    .filter((k) => k.y === 5)
    .reduce((a, b) => (b.x + (b.w ?? 1) > a.x + (a.w ?? 1) ? b : a));
  const arrowStartX = lastBottom.x + (lastBottom.w ?? 1);
  // ISO enter: single L-shaped key spanning rows 2 and 3.
  // Bounding box: x=13.5..15, y=2..4. Top portion 1.5U wide (row 2),
  // bottom portion 1.25U wide (row 3) starting at x=13.75. The 0.25U
  // notch on the bottom-left makes room for the narrow backslash key
  // sitting in the ASDF row.
  const extras: KeyDef[] = [];
  if (variant === "iso") {
    extras.push({
      code: "return_or_enter",
      label: "⏎",
      x: 13.5,
      y: 2,
      w: 1.5,
      h: 2,
      shape: "iso_enter",
    });
  }
  return [...main, ...extras, ...arrows(arrowStartX)];
}

export const LAYOUTS: Record<Variant, KeyDef[]> = {
  ansi: buildLayout("ansi"),
  iso: buildLayout("iso"),
};

export const KEYBOARD_COLS = 15;
export const KEYBOARD_ROWS = 6;

export function pickVariant(codes: Iterable<string>): Variant {
  for (const c of codes) {
    if (c === "non_us_backslash" || c === "non_us_pound") return "iso";
  }
  return "ansi";
}
