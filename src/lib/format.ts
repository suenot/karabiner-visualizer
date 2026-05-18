import type { Manipulator, Modifier, ToSpec } from "./karabiner";

export const MOD_GLYPH: Record<string, string> = {
  left_command: "⌘ᴸ",
  right_command: "⌘ᴿ",
  command: "⌘",
  left_option: "⌥ᴸ",
  right_option: "⌥ᴿ",
  option: "⌥",
  left_control: "⌃ᴸ",
  right_control: "⌃ᴿ",
  control: "⌃",
  left_shift: "⇧ᴸ",
  right_shift: "⇧ᴿ",
  shift: "⇧",
  fn: "fn",
  caps_lock: "⇪",
  any: "*",
};

export const KEY_GLYPH: Record<string, string> = {
  left_arrow: "←",
  right_arrow: "→",
  up_arrow: "↑",
  down_arrow: "↓",
  return_or_enter: "⏎",
  delete_or_backspace: "⌫",
  delete_forward: "⌦",
  escape: "esc",
  tab: "⇥",
  spacebar: "␣",
  page_up: "PgUp",
  page_down: "PgDn",
  home: "Home",
  end: "End",
  caps_lock: "⇪",
  left_shift: "⇧",
  right_shift: "⇧",
  left_command: "⌘",
  right_command: "⌘",
  left_option: "⌥",
  right_option: "⌥",
  left_control: "⌃",
  right_control: "⌃",
  fn: "fn",
  grave_accent_and_tilde: "`",
  hyphen: "-",
  equal_sign: "=",
  open_bracket: "[",
  close_bracket: "]",
  backslash: "\\",
  semicolon: ";",
  quote: "'",
  comma: ",",
  period: ".",
  slash: "/",
  keypad_0: "0",
  keypad_1: "1",
  keypad_2: "2",
  keypad_3: "3",
  keypad_4: "4",
  keypad_5: "5",
  keypad_6: "6",
  keypad_7: "7",
  keypad_8: "8",
  keypad_9: "9",
  keypad_period: ".",
  keypad_plus: "+",
  keypad_hyphen: "−",
  keypad_asterisk: "×",
  keypad_slash: "÷",
  keypad_enter: "⏎",
  keypad_equal_sign: "=",
  keypad_num_lock: "num",
  application: "menu",
};

export function glyph(code: string): string {
  return KEY_GLYPH[code] ?? code.toUpperCase();
}

export function modLabel(mods: Modifier[]): string {
  if (mods.length === 0) return "no modifier";
  return mods.map((m) => MOD_GLYPH[m] ?? m).join(" + ");
}

export function modKey(mods: Modifier[]): string {
  return [...mods].sort().join("+") || "_none";
}

export function fromMods(m: Manipulator): Modifier[] {
  return (m.from?.modifiers?.mandatory ?? []) as Modifier[];
}

export function formatTo(tos: ToSpec[] | undefined): {
  glyph: string;
  full: string;
  isShell: boolean;
} {
  if (!tos || tos.length === 0) return { glyph: "·", full: "(no output)", isShell: false };
  const t = tos[0];
  if (t.shell_command) {
    return {
      glyph: "$",
      full: t.shell_command,
      isShell: true,
    };
  }
  const mods = Array.isArray(t.modifiers)
    ? (t.modifiers as Modifier[])
    : ((t.modifiers?.mandatory ?? []) as Modifier[]);
  const keyG = t.key_code ? glyph(t.key_code) : "?";
  const modPrefix = mods.length ? mods.map((m) => MOD_GLYPH[m] ?? m).join("") + " " : "";
  const full = `${modPrefix}${t.key_code ?? "?"}`;
  return { glyph: `${modPrefix}${keyG}`, full, isShell: false };
}
