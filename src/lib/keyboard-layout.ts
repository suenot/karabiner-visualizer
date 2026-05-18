export type KeyDef = {
  code: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
};

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

const rows: Row[] = [
  {
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
  },
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
  {
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
  },
];

const main = expand(rows);
const last = main[main.length - 1];
const arrowStackX = last.x + (last.w ?? 1);
const arrows: KeyDef[] = [
  { code: "up_arrow", label: "▲", x: arrowStackX, y: 5, w: 1, h: 0.5 },
  { code: "down_arrow", label: "▼", x: arrowStackX, y: 5.5, w: 1, h: 0.5 },
  { code: "right_arrow", label: "▶", x: arrowStackX + 1, y: 5, w: 1, h: 1 },
];

export const KEYBOARD: KeyDef[] = [...main, ...arrows];
export const KEYBOARD_COLS = 15;
export const KEYBOARD_ROWS = 6;

const onBoardCodes = new Set(KEYBOARD.map((k) => k.code));
export function isOnBoard(code: string): boolean {
  return onBoardCodes.has(code);
}
