export type GalleryItem = {
  id: string;
  title: string;
  fileName: string;
  note: string;
  source: string;
  /** Optional grouping label shown above the chip row. */
  group?: string;
};

const capsToCtrl = `{
  "title": "caps_lock to control",
  "rules": [
    {
      "description": "Caps Lock → Left Control",
      "manipulators": [
        {
          "type": "basic",
          "from": { "key_code": "caps_lock" },
          "to": [{ "key_code": "left_control" }]
        }
      ]
    }
  ]
}
`;

const vimArrows = `{
  "title": "vim arrows on Right Option",
  "rules": [
    {
      "description": "HJKL arrows when right_option is held",
      "manipulators": [
        {
          "type": "basic",
          "from": {
            "key_code": "h",
            "modifiers": { "mandatory": ["right_option"], "optional": ["any"] }
          },
          "to": [{ "key_code": "left_arrow" }]
        },
        {
          "type": "basic",
          "from": {
            "key_code": "j",
            "modifiers": { "mandatory": ["right_option"], "optional": ["any"] }
          },
          "to": [{ "key_code": "down_arrow" }]
        },
        {
          "type": "basic",
          "from": {
            "key_code": "k",
            "modifiers": { "mandatory": ["right_option"], "optional": ["any"] }
          },
          "to": [{ "key_code": "up_arrow" }]
        },
        {
          "type": "basic",
          "from": {
            "key_code": "l",
            "modifiers": { "mandatory": ["right_option"], "optional": ["any"] }
          },
          "to": [{ "key_code": "right_arrow" }]
        }
      ]
    }
  ]
}
`;

const numpadLayer = `{
  "title": "numpad",
  "rules": [
    {
      "description": "right_command + left letters = numpad",
      "manipulators": [
        {
          "type": "basic",
          "from": { "key_code": "z", "modifiers": { "mandatory": ["right_command"], "optional": ["any"] } },
          "to": [{ "key_code": "keypad_0" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "x", "modifiers": { "mandatory": ["right_command"], "optional": ["any"] } },
          "to": [{ "key_code": "keypad_1" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "c", "modifiers": { "mandatory": ["right_command"], "optional": ["any"] } },
          "to": [{ "key_code": "keypad_2" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "v", "modifiers": { "mandatory": ["right_command"], "optional": ["any"] } },
          "to": [{ "key_code": "keypad_3" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "s", "modifiers": { "mandatory": ["right_command"], "optional": ["any"] } },
          "to": [{ "key_code": "keypad_4" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "d", "modifiers": { "mandatory": ["right_command"], "optional": ["any"] } },
          "to": [{ "key_code": "keypad_5" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "f", "modifiers": { "mandatory": ["right_command"], "optional": ["any"] } },
          "to": [{ "key_code": "keypad_6" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "w", "modifiers": { "mandatory": ["right_command"], "optional": ["any"] } },
          "to": [{ "key_code": "keypad_7" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "e", "modifiers": { "mandatory": ["right_command"], "optional": ["any"] } },
          "to": [{ "key_code": "keypad_8" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "r", "modifiers": { "mandatory": ["right_command"], "optional": ["any"] } },
          "to": [{ "key_code": "keypad_9" }]
        }
      ]
    }
  ]
}
`;

const launcherShell = `{
  "title": "launcher: hyper + key = open app",
  "rules": [
    {
      "description": "Hyper (caps remapped) + B = browser, + T = terminal",
      "manipulators": [
        {
          "type": "basic",
          "from": {
            "key_code": "b",
            "modifiers": {
              "mandatory": ["left_command", "left_control", "left_option", "left_shift"]
            }
          },
          "to": [
            { "shell_command": "open -a 'Safari'" }
          ]
        },
        {
          "type": "basic",
          "from": {
            "key_code": "t",
            "modifiers": {
              "mandatory": ["left_command", "left_control", "left_option", "left_shift"]
            }
          },
          "to": [
            { "shell_command": "open -a 'Terminal'" }
          ]
        }
      ]
    }
  ]
}
`;

const empty = `{
  "title": "blank",
  "rules": [
    {
      "description": "start typing your own rule…",
      "manipulators": []
    }
  ]
}
`;

const hyperOnCaps = `{
  "title": "Hyper key on Caps Lock",
  "rules": [
    {
      "description": "Caps Lock = Hyper (⌘ + ⌃ + ⌥ + ⇧)",
      "manipulators": [
        {
          "type": "basic",
          "from": {
            "key_code": "caps_lock",
            "modifiers": { "optional": ["any"] }
          },
          "to": [
            {
              "key_code": "left_shift",
              "modifiers": ["left_command", "left_control", "left_option"]
            }
          ]
        }
      ]
    }
  ]
}
`;

const capsEscCtrl = `{
  "title": "Caps Lock = Esc / Control",
  "rules": [
    {
      "description": "Tap Caps Lock for Escape, hold for Left Control",
      "manipulators": [
        {
          "type": "basic",
          "from": {
            "key_code": "caps_lock",
            "modifiers": { "optional": ["any"] }
          },
          "to": [{ "key_code": "left_control" }],
          "to_if_alone": [{ "key_code": "escape" }]
        }
      ]
    }
  ]
}
`;

const rightShiftEnter = `{
  "title": "Right Shift = Enter on tap",
  "rules": [
    {
      "description": "Right Shift acts as Enter when tapped, Shift when held",
      "manipulators": [
        {
          "type": "basic",
          "from": {
            "key_code": "right_shift",
            "modifiers": { "optional": ["any"] }
          },
          "to": [{ "key_code": "right_shift" }],
          "to_if_alone": [{ "key_code": "return_or_enter" }]
        }
      ]
    }
  ]
}
`;

const homeRowMods = `{
  "title": "Home row mods (ASDF / JKL;)",
  "rules": [
    {
      "description": "Hold A=⌘ S=⌥ D=⌃ F=⇧ — tap for letter (mirrored on JKL;)",
      "manipulators": [
        {
          "type": "basic",
          "from": { "key_code": "a", "modifiers": { "optional": ["any"] } },
          "to": [{ "key_code": "left_command" }],
          "to_if_alone": [{ "key_code": "a" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "s", "modifiers": { "optional": ["any"] } },
          "to": [{ "key_code": "left_option" }],
          "to_if_alone": [{ "key_code": "s" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "d", "modifiers": { "optional": ["any"] } },
          "to": [{ "key_code": "left_control" }],
          "to_if_alone": [{ "key_code": "d" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "f", "modifiers": { "optional": ["any"] } },
          "to": [{ "key_code": "left_shift" }],
          "to_if_alone": [{ "key_code": "f" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "j", "modifiers": { "optional": ["any"] } },
          "to": [{ "key_code": "right_shift" }],
          "to_if_alone": [{ "key_code": "j" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "k", "modifiers": { "optional": ["any"] } },
          "to": [{ "key_code": "right_control" }],
          "to_if_alone": [{ "key_code": "k" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "l", "modifiers": { "optional": ["any"] } },
          "to": [{ "key_code": "right_option" }],
          "to_if_alone": [{ "key_code": "l" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "semicolon", "modifiers": { "optional": ["any"] } },
          "to": [{ "key_code": "right_command" }],
          "to_if_alone": [{ "key_code": "semicolon" }]
        }
      ]
    }
  ]
}
`;

const spaceCmd = `{
  "title": "Space → Cmd on hold",
  "rules": [
    {
      "description": "Hold space for ⌘, tap for space",
      "manipulators": [
        {
          "type": "basic",
          "from": {
            "key_code": "spacebar",
            "modifiers": { "optional": ["any"] }
          },
          "to": [{ "key_code": "left_command" }],
          "to_if_alone": [{ "key_code": "spacebar" }]
        }
      ]
    }
  ]
}
`;

const symbolLayer = `{
  "title": "Symbol layer on Right ⌥",
  "rules": [
    {
      "description": "Right Option + home row = brackets, quotes, operators",
      "manipulators": [
        {
          "type": "basic",
          "from": { "key_code": "u", "modifiers": { "mandatory": ["right_option"], "optional": ["any"] } },
          "to": [{ "key_code": "9", "modifiers": ["left_shift"] }]
        },
        {
          "type": "basic",
          "from": { "key_code": "i", "modifiers": { "mandatory": ["right_option"], "optional": ["any"] } },
          "to": [{ "key_code": "0", "modifiers": ["left_shift"] }]
        },
        {
          "type": "basic",
          "from": { "key_code": "o", "modifiers": { "mandatory": ["right_option"], "optional": ["any"] } },
          "to": [{ "key_code": "open_bracket" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "p", "modifiers": { "mandatory": ["right_option"], "optional": ["any"] } },
          "to": [{ "key_code": "close_bracket" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "j", "modifiers": { "mandatory": ["right_option"], "optional": ["any"] } },
          "to": [{ "key_code": "open_bracket", "modifiers": ["left_shift"] }]
        },
        {
          "type": "basic",
          "from": { "key_code": "k", "modifiers": { "mandatory": ["right_option"], "optional": ["any"] } },
          "to": [{ "key_code": "close_bracket", "modifiers": ["left_shift"] }]
        },
        {
          "type": "basic",
          "from": { "key_code": "h", "modifiers": { "mandatory": ["right_option"], "optional": ["any"] } },
          "to": [{ "key_code": "equal_sign" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "l", "modifiers": { "mandatory": ["right_option"], "optional": ["any"] } },
          "to": [{ "key_code": "hyphen" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "n", "modifiers": { "mandatory": ["right_option"], "optional": ["any"] } },
          "to": [{ "key_code": "quote" }]
        },
        {
          "type": "basic",
          "from": { "key_code": "m", "modifiers": { "mandatory": ["right_option"], "optional": ["any"] } },
          "to": [{ "key_code": "quote", "modifiers": ["left_shift"] }]
        }
      ]
    }
  ]
}
`;

const tilingHyper = `{
  "title": "Window tiling (Hyper + HJKL)",
  "rules": [
    {
      "description": "Hyper + HJKL triggers Rectangle window tiles (left/down/up/right halves)",
      "manipulators": [
        {
          "type": "basic",
          "from": {
            "key_code": "h",
            "modifiers": {
              "mandatory": ["left_command", "left_control", "left_option", "left_shift"]
            }
          },
          "to": [{ "shell_command": "open -g 'rectangle://execute-action?name=left-half'" }]
        },
        {
          "type": "basic",
          "from": {
            "key_code": "j",
            "modifiers": {
              "mandatory": ["left_command", "left_control", "left_option", "left_shift"]
            }
          },
          "to": [{ "shell_command": "open -g 'rectangle://execute-action?name=bottom-half'" }]
        },
        {
          "type": "basic",
          "from": {
            "key_code": "k",
            "modifiers": {
              "mandatory": ["left_command", "left_control", "left_option", "left_shift"]
            }
          },
          "to": [{ "shell_command": "open -g 'rectangle://execute-action?name=top-half'" }]
        },
        {
          "type": "basic",
          "from": {
            "key_code": "l",
            "modifiers": {
              "mandatory": ["left_command", "left_control", "left_option", "left_shift"]
            }
          },
          "to": [{ "shell_command": "open -g 'rectangle://execute-action?name=right-half'" }]
        },
        {
          "type": "basic",
          "from": {
            "key_code": "f",
            "modifiers": {
              "mandatory": ["left_command", "left_control", "left_option", "left_shift"]
            }
          },
          "to": [{ "shell_command": "open -g 'rectangle://execute-action?name=maximize'" }]
        }
      ]
    }
  ]
}
`;

export const GALLERY: GalleryItem[] = [
  // Classics — single-key tweaks loved by the Karabiner community.
  {
    id: "caps-to-ctrl",
    group: "Classics",
    title: "Caps → Ctrl",
    fileName: "caps_to_control.json",
    note: "Caps Lock acts as Left Control. One of the most loved remaps.",
    source: capsToCtrl,
  },
  {
    id: "caps-esc-ctrl",
    group: "Classics",
    title: "Caps = Esc / Ctrl",
    fileName: "caps_esc_ctrl.json",
    note: "Tap Caps for Escape, hold for Control. Steve Losh's classic dual function.",
    source: capsEscCtrl,
  },
  {
    id: "hyper-on-caps",
    group: "Classics",
    title: "Hyper key on Caps",
    fileName: "hyper_on_caps.json",
    note: "Caps Lock fires ⌘+⌃+⌥+⇧ together — a free 'Hyper' modifier for app shortcuts.",
    source: hyperOnCaps,
  },
  {
    id: "right-shift-enter",
    group: "Classics",
    title: "Right Shift = Enter on tap",
    fileName: "right_shift_enter.json",
    note: "Right Shift becomes Enter when tapped, still Shift when held.",
    source: rightShiftEnter,
  },
  {
    id: "space-cmd",
    group: "Classics",
    title: "Space → ⌘ on hold",
    fileName: "space_to_cmd.json",
    note: "Tap = space, hold = Command. Big win on laptops with cramped modifiers.",
    source: spaceCmd,
  },
  {
    id: "home-row-mods",
    group: "Classics",
    title: "Home row mods (ASDF/JKL;)",
    fileName: "home_row_mods.json",
    note: "Mod-tap on the home row: A=⌘ S=⌥ D=⌃ F=⇧ (mirrored on right hand). Tap for letter.",
    source: homeRowMods,
  },

  // Layers — modifier-held key clusters.
  {
    id: "vim-arrows",
    group: "Layers",
    title: "Vim arrows (HJKL)",
    fileName: "vim_arrows.json",
    note: "Hold right Option — HJKL behave as arrow keys.",
    source: vimArrows,
  },
  {
    id: "symbol-layer",
    group: "Layers",
    title: "Symbols on Right ⌥",
    fileName: "symbol_layer.json",
    note: "Right Option turns the home row into brackets, parens, quotes, =, -.",
    source: symbolLayer,
  },
  {
    id: "numpad",
    group: "Layers",
    title: "Numpad on Right ⌘",
    fileName: "numpad.json",
    note: "Hold right Command — left letters become a numpad (W/E/R = 7/8/9 …).",
    source: numpadLayer,
  },

  // Productivity — shell commands and OS automation.
  {
    id: "launcher",
    group: "Productivity",
    title: "App launcher (Hyper)",
    fileName: "launcher.json",
    note: "Hyper (⌘+⌃+⌥+⇧) + letter runs a shell command to open an app.",
    source: launcherShell,
  },
  {
    id: "tiling-hyper",
    group: "Productivity",
    title: "Window tiling (Hyper + HJKL)",
    fileName: "window_tiling.json",
    note: "Hyper + HJKL triggers Rectangle window tiles (install Rectangle to use).",
    source: tilingHyper,
  },

  // Starter — empty template.
  {
    id: "blank",
    group: "Starter",
    title: "Blank",
    fileName: "draft.json",
    note: "Start from scratch.",
    source: empty,
  },
];
