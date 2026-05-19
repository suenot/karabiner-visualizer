export type GalleryItem = {
  id: string;
  title: string;
  fileName: string;
  note: string;
  source: string;
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

export const GALLERY: GalleryItem[] = [
  {
    id: "caps-to-ctrl",
    title: "Caps → Ctrl",
    fileName: "caps_to_control.json",
    note: "Classic: Caps Lock acts as Left Control. One of the most loved remaps.",
    source: capsToCtrl,
  },
  {
    id: "vim-arrows",
    title: "Vim arrows (HJKL)",
    fileName: "vim_arrows.json",
    note: "Hold right_option and HJKL act as arrow keys.",
    source: vimArrows,
  },
  {
    id: "numpad",
    title: "Numpad on Right ⌘",
    fileName: "numpad.json",
    note: "Hold right Command — left letters become a numpad (W/E/R = 7/8/9 …).",
    source: numpadLayer,
  },
  {
    id: "launcher",
    title: "App launcher (Hyper)",
    fileName: "launcher.json",
    note: "Hyper (⌘+⌃+⌥+⇧) + letter runs a shell command to open an app.",
    source: launcherShell,
  },
  {
    id: "blank",
    title: "Blank",
    fileName: "draft.json",
    note: "Start from scratch.",
    source: empty,
  },
];
