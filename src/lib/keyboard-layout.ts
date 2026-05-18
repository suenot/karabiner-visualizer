export type KeyDef = {
  code: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
};

export const KEY_UNIT = 56;
export const KEY_GAP = 4;
export const KEY_RADIUS = 8;

type RowSpec = Array<
  | string
  | { code: string; label?: string; sub?: string; w?: number; gap?: number }
>;

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
  delete_or_backspace: { label: "⌫", sub: "delete" },
  delete_forward: { label: "⌦", sub: "fwd del" },
  return_or_enter: { label: "⏎", sub: "return" },
  tab: { label: "⇥", sub: "tab" },
  caps_lock: { label: "⇪", sub: "caps" },
  left_shift: { label: "⇧", sub: "shift" },
  right_shift: { label: "⇧", sub: "shift" },
  left_control: { label: "⌃", sub: "ctrl" },
  right_control: { label: "⌃", sub: "ctrl" },
  left_option: { label: "⌥", sub: "option" },
  right_option: { label: "⌥", sub: "option" },
  left_command: { label: "⌘", sub: "cmd" },
  right_command: { label: "⌘", sub: "cmd" },
  spacebar: { label: "␣", sub: "space" },
  escape: { label: "esc" },
  fn: { label: "fn" },
  left_arrow: { label: "◀" },
  right_arrow: { label: "▶" },
  up_arrow: { label: "▲" },
  down_arrow: { label: "▼" },
  page_up: { label: "⇞", sub: "pg up" },
  page_down: { label: "⇟", sub: "pg dn" },
  home: { label: "↖", sub: "home" },
  end: { label: "↘", sub: "end" },
  keypad_num_lock: { label: "clr", sub: "num" },
  keypad_slash: { label: "/" },
  keypad_asterisk: { label: "*" },
  keypad_hyphen: { label: "−" },
  keypad_plus: { label: "+" },
  keypad_enter: { label: "⏎" },
  keypad_period: { label: "." },
  keypad_0: { label: "0" },
  keypad_1: { label: "1" },
  keypad_2: { label: "2" },
  keypad_3: { label: "3" },
  keypad_4: { label: "4" },
  keypad_5: { label: "5" },
  keypad_6: { label: "6" },
  keypad_7: { label: "7" },
  keypad_8: { label: "8" },
  keypad_9: { label: "9" },
};

function digitsRow(): RowSpec {
  return [
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
  ];
}

function fnRow(): RowSpec {
  return [
    "escape",
    "f1",
    "f2",
    "f3",
    "f4",
    "f5",
    "f6",
    "f7",
    "f8",
    "f9",
    "f10",
    "f11",
    "f12",
  ];
}

function rowQ(): RowSpec {
  return [
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
  ];
}

function rowA(): RowSpec {
  return [
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
  ];
}

function rowZ(): RowSpec {
  return [
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
  ];
}

function bottomRow(): RowSpec {
  return [
    { code: "fn", w: 1 },
    { code: "left_control", w: 1.25 },
    { code: "left_option", w: 1.25 },
    { code: "left_command", w: 1.25 },
    { code: "spacebar", w: 5 },
    { code: "right_command", w: 1.25 },
    { code: "right_option", w: 1.25 },
    { code: "right_control", w: 1.25 },
  ];
}

function build(rows: RowSpec[]): KeyDef[] {
  const out: KeyDef[] = [];
  rows.forEach((row, rowIdx) => {
    let x = 0;
    for (const item of row) {
      if (typeof item === "string") {
        const meta = labelMap[item];
        out.push({
          code: item,
          label: meta?.label ?? item.toUpperCase(),
          sub: meta?.sub,
          x,
          y: rowIdx,
          w: 1,
        });
        x += 1;
      } else {
        if (item.gap) x += item.gap;
        const meta = labelMap[item.code];
        const w = item.w ?? 1;
        out.push({
          code: item.code,
          label: item.label ?? meta?.label ?? item.code.toUpperCase(),
          sub: item.sub ?? meta?.sub,
          x,
          y: rowIdx,
          w,
        });
        x += w;
      }
    }
  });
  return out;
}

const main: KeyDef[] = build([
  fnRow(),
  digitsRow(),
  rowQ(),
  rowA(),
  rowZ(),
  bottomRow(),
]);

const arrowClusterX = 16;
const arrowKeys: KeyDef[] = [
  { code: "left_arrow", label: "◀", x: arrowClusterX, y: 5, w: 1 },
  { code: "down_arrow", label: "▼", x: arrowClusterX + 1, y: 5, w: 1 },
  { code: "up_arrow", label: "▲", x: arrowClusterX + 1, y: 4.5, w: 1, h: 0.5 },
  { code: "right_arrow", label: "▶", x: arrowClusterX + 2, y: 5, w: 1 },
];

const navClusterX = 16;
const navKeys: KeyDef[] = [
  { code: "home", label: "↖", sub: "home", x: navClusterX, y: 1, w: 1 },
  { code: "page_up", label: "⇞", sub: "pg up", x: navClusterX + 1, y: 1, w: 1 },
  { code: "delete_forward", label: "⌦", sub: "fwd del", x: navClusterX + 2, y: 1, w: 1 },
  { code: "end", label: "↘", sub: "end", x: navClusterX, y: 2, w: 1 },
  { code: "page_down", label: "⇟", sub: "pg dn", x: navClusterX + 1, y: 2, w: 1 },
];

const numpadX = 20;
const numpadKeys: KeyDef[] = [
  { code: "keypad_num_lock", label: "clr", sub: "num", x: numpadX, y: 1, w: 1 },
  { code: "keypad_slash", label: "/", x: numpadX + 1, y: 1, w: 1 },
  { code: "keypad_asterisk", label: "*", x: numpadX + 2, y: 1, w: 1 },
  { code: "keypad_hyphen", label: "−", x: numpadX + 3, y: 1, w: 1 },
  { code: "keypad_7", label: "7", x: numpadX, y: 2, w: 1 },
  { code: "keypad_8", label: "8", x: numpadX + 1, y: 2, w: 1 },
  { code: "keypad_9", label: "9", x: numpadX + 2, y: 2, w: 1 },
  { code: "keypad_plus", label: "+", x: numpadX + 3, y: 2, w: 1, h: 2 },
  { code: "keypad_4", label: "4", x: numpadX, y: 3, w: 1 },
  { code: "keypad_5", label: "5", x: numpadX + 1, y: 3, w: 1 },
  { code: "keypad_6", label: "6", x: numpadX + 2, y: 3, w: 1 },
  { code: "keypad_1", label: "1", x: numpadX, y: 4, w: 1 },
  { code: "keypad_2", label: "2", x: numpadX + 1, y: 4, w: 1 },
  { code: "keypad_3", label: "3", x: numpadX + 2, y: 4, w: 1 },
  { code: "keypad_enter", label: "⏎", x: numpadX + 3, y: 4, w: 1, h: 2 },
  { code: "keypad_0", label: "0", x: numpadX, y: 5, w: 2 },
  { code: "keypad_period", label: ".", x: numpadX + 2, y: 5, w: 1 },
];

export const KEYBOARD: KeyDef[] = [...main, ...arrowKeys, ...navKeys, ...numpadKeys];

export const KEYBOARD_COLS = 24;
export const KEYBOARD_ROWS = 6;

export function findKey(code: string): KeyDef | undefined {
  return KEYBOARD.find((k) => k.code === code);
}
