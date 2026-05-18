// Karabiner key_code -> per-target key name.
// `null` means the target has no direct equivalent; we'll emit a comment.

export type Target = "kanata" | "ahk" | "keyd" | "xremap" | "kmonad";

export type TargetName = string | null;
export type KeyMap = Record<Target, TargetName>;

const letters = "abcdefghijklmnopqrstuvwxyz".split("");
const digits = "0123456789".split("");

function direct(name: string): KeyMap {
  return {
    kanata: name,
    ahk: name,
    keyd: name,
    xremap: name,
    kmonad: name,
  };
}

export const KEY_MAP: Record<string, KeyMap> = {
  ...Object.fromEntries(letters.map((c) => [c, direct(c)])),
  ...Object.fromEntries(
    digits.map((d) => [
      d,
      {
        kanata: d,
        ahk: d,
        keyd: d,
        xremap: `Key_${d}`,
        kmonad: d,
      },
    ]),
  ),
  grave_accent_and_tilde: {
    kanata: "grv",
    ahk: "``",
    keyd: "grave",
    xremap: "grave",
    kmonad: "grv",
  },
  hyphen: {
    kanata: "-",
    ahk: "-",
    keyd: "minus",
    xremap: "minus",
    kmonad: "-",
  },
  equal_sign: {
    kanata: "=",
    ahk: "=",
    keyd: "equal",
    xremap: "equal",
    kmonad: "=",
  },
  open_bracket: {
    kanata: "[",
    ahk: "[",
    keyd: "leftbrace",
    xremap: "bracketleft",
    kmonad: "[",
  },
  close_bracket: {
    kanata: "]",
    ahk: "]",
    keyd: "rightbrace",
    xremap: "bracketright",
    kmonad: "]",
  },
  backslash: {
    kanata: "\\",
    ahk: "\\",
    keyd: "backslash",
    xremap: "backslash",
    kmonad: "\\",
  },
  semicolon: {
    kanata: "scln",
    ahk: ";",
    keyd: "semicolon",
    xremap: "semicolon",
    kmonad: "scln",
  },
  quote: {
    kanata: "'",
    ahk: "'",
    keyd: "apostrophe",
    xremap: "apostrophe",
    kmonad: "'",
  },
  comma: {
    kanata: ",",
    ahk: ",",
    keyd: "comma",
    xremap: "comma",
    kmonad: ",",
  },
  period: {
    kanata: ".",
    ahk: ".",
    keyd: "dot",
    xremap: "period",
    kmonad: ".",
  },
  slash: {
    kanata: "/",
    ahk: "/",
    keyd: "slash",
    xremap: "slash",
    kmonad: "/",
  },
  non_us_backslash: {
    kanata: "102d",
    ahk: null,
    keyd: "102nd",
    xremap: "ISO_Level3_Shift",
    kmonad: "102d",
  },

  // Editing / nav
  return_or_enter: {
    kanata: "ret",
    ahk: "Enter",
    keyd: "enter",
    xremap: "Return",
    kmonad: "ret",
  },
  delete_or_backspace: {
    kanata: "bspc",
    ahk: "Backspace",
    keyd: "backspace",
    xremap: "BackSpace",
    kmonad: "bspc",
  },
  delete_forward: {
    kanata: "del",
    ahk: "Delete",
    keyd: "delete",
    xremap: "Delete",
    kmonad: "del",
  },
  escape: {
    kanata: "esc",
    ahk: "Escape",
    keyd: "esc",
    xremap: "Escape",
    kmonad: "esc",
  },
  tab: {
    kanata: "tab",
    ahk: "Tab",
    keyd: "tab",
    xremap: "Tab",
    kmonad: "tab",
  },
  spacebar: {
    kanata: "spc",
    ahk: "Space",
    keyd: "space",
    xremap: "space",
    kmonad: "spc",
  },
  caps_lock: {
    kanata: "caps",
    ahk: "CapsLock",
    keyd: "capslock",
    xremap: "CapsLock",
    kmonad: "caps",
  },

  // Arrows
  left_arrow: {
    kanata: "left",
    ahk: "Left",
    keyd: "left",
    xremap: "Left",
    kmonad: "lft",
  },
  right_arrow: {
    kanata: "rght",
    ahk: "Right",
    keyd: "right",
    xremap: "Right",
    kmonad: "rght",
  },
  up_arrow: {
    kanata: "up",
    ahk: "Up",
    keyd: "up",
    xremap: "Up",
    kmonad: "up",
  },
  down_arrow: {
    kanata: "down",
    ahk: "Down",
    keyd: "down",
    xremap: "Down",
    kmonad: "down",
  },

  // Nav cluster
  page_up: {
    kanata: "pgup",
    ahk: "PgUp",
    keyd: "pageup",
    xremap: "Page_Up",
    kmonad: "pgup",
  },
  page_down: {
    kanata: "pgdn",
    ahk: "PgDn",
    keyd: "pagedown",
    xremap: "Page_Down",
    kmonad: "pgdn",
  },
  home: {
    kanata: "home",
    ahk: "Home",
    keyd: "home",
    xremap: "Home",
    kmonad: "home",
  },
  end: { kanata: "end", ahk: "End", keyd: "end", xremap: "End", kmonad: "end" },

  // Modifiers
  left_shift: {
    kanata: "lsft",
    ahk: "LShift",
    keyd: "leftshift",
    xremap: "Shift_L",
    kmonad: "lsft",
  },
  right_shift: {
    kanata: "rsft",
    ahk: "RShift",
    keyd: "rightshift",
    xremap: "Shift_R",
    kmonad: "rsft",
  },
  left_control: {
    kanata: "lctl",
    ahk: "LCtrl",
    keyd: "leftcontrol",
    xremap: "Control_L",
    kmonad: "lctl",
  },
  right_control: {
    kanata: "rctl",
    ahk: "RCtrl",
    keyd: "rightcontrol",
    xremap: "Control_R",
    kmonad: "rctl",
  },
  left_option: {
    kanata: "lalt",
    ahk: "LAlt",
    keyd: "leftalt",
    xremap: "Alt_L",
    kmonad: "lalt",
  },
  right_option: {
    kanata: "ralt",
    ahk: "RAlt",
    keyd: "rightalt",
    xremap: "Alt_R",
    kmonad: "ralt",
  },
  left_command: {
    kanata: "lmet",
    ahk: "LWin",
    keyd: "leftmeta",
    xremap: "Super_L",
    kmonad: "lmet",
  },
  right_command: {
    kanata: "rmet",
    ahk: "RWin",
    keyd: "rightmeta",
    xremap: "Super_R",
    kmonad: "rmet",
  },
  command: {
    kanata: "lmet",
    ahk: "LWin",
    keyd: "leftmeta",
    xremap: "Super",
    kmonad: "lmet",
  },
  option: {
    kanata: "lalt",
    ahk: "LAlt",
    keyd: "leftalt",
    xremap: "Alt",
    kmonad: "lalt",
  },
  control: {
    kanata: "lctl",
    ahk: "LCtrl",
    keyd: "leftcontrol",
    xremap: "Control",
    kmonad: "lctl",
  },
  shift: {
    kanata: "lsft",
    ahk: "LShift",
    keyd: "leftshift",
    xremap: "Shift",
    kmonad: "lsft",
  },
  fn: {
    kanata: null,
    ahk: null,
    keyd: "fn",
    xremap: null,
    kmonad: null,
  },

  // Numpad
  ...Object.fromEntries(
    digits.map((d) => [
      `keypad_${d}`,
      {
        kanata: `kp${d}`,
        ahk: `Numpad${d}`,
        keyd: `kp${d}`,
        xremap: `KP_${d}`,
        kmonad: `kp${d}`,
      },
    ]),
  ),
  keypad_period: {
    kanata: "kp.",
    ahk: "NumpadDot",
    keyd: "kpdot",
    xremap: "KP_Decimal",
    kmonad: "kp.",
  },
  keypad_plus: {
    kanata: "kp+",
    ahk: "NumpadAdd",
    keyd: "kpplus",
    xremap: "KP_Add",
    kmonad: "kp+",
  },
  keypad_hyphen: {
    kanata: "kp-",
    ahk: "NumpadSub",
    keyd: "kpminus",
    xremap: "KP_Subtract",
    kmonad: "kp-",
  },
  keypad_asterisk: {
    kanata: "kp*",
    ahk: "NumpadMult",
    keyd: "kpasterisk",
    xremap: "KP_Multiply",
    kmonad: "kp*",
  },
  keypad_slash: {
    kanata: "kp/",
    ahk: "NumpadDiv",
    keyd: "kpslash",
    xremap: "KP_Divide",
    kmonad: "kp/",
  },
  keypad_enter: {
    kanata: "kprt",
    ahk: "NumpadEnter",
    keyd: "kpenter",
    xremap: "KP_Enter",
    kmonad: "kprt",
  },
  keypad_num_lock: {
    kanata: "nlck",
    ahk: "NumLock",
    keyd: "numlock",
    xremap: "Num_Lock",
    kmonad: "nlck",
  },

  // Function row
  ...Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => i + 1).map((n) => [
      `f${n}`,
      {
        kanata: `f${n}`,
        ahk: `F${n}`,
        keyd: `f${n}`,
        xremap: `F${n}`,
        kmonad: `f${n}`,
      },
    ]),
  ),
};

export function toKey(code: string, target: Target): TargetName {
  return KEY_MAP[code]?.[target] ?? null;
}
