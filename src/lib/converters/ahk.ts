import type { RuleFile, Manipulator, Modifier } from "../karabiner";
import { fromMods } from "../format";
import { toKey } from "./keymap";

// AutoHotkey v2 hotkey modifier prefixes.
const PREFIX: Partial<Record<Modifier, string>> = {
  left_shift: "<+",
  right_shift: ">+",
  shift: "+",
  left_control: "<^",
  right_control: ">^",
  control: "^",
  left_option: "<!",
  right_option: ">!",
  option: "!",
  left_command: "<#",
  right_command: ">#",
  command: "#",
};

function ahkKey(code: string): string {
  return toKey(code, "ahk") ?? `; <no-ahk-equivalent:${code}>`;
}

function sendKey(code: string, mods: Modifier[]): string {
  const k = ahkKey(code);
  // AHK Send modifiers inline: e.g. "^c" for Ctrl+C, "^{Home}" for Ctrl+Home
  const modPrefix = mods
    .map((m) => {
      switch (m) {
        case "shift":
        case "left_shift":
        case "right_shift":
          return "+";
        case "control":
        case "left_control":
        case "right_control":
          return "^";
        case "option":
        case "left_option":
        case "right_option":
          return "!";
        case "command":
        case "left_command":
        case "right_command":
          return "#";
        default:
          return "";
      }
    })
    .join("");
  // Wrap multi-char keys in braces.
  const needsBraces = /^[A-Z][A-Za-z0-9]+$/.test(k) || k.length > 1;
  const body = needsBraces ? `{${k}}` : k;
  return modPrefix + body;
}

function hotkeyTrigger(fromCode: string, mods: Modifier[]): string {
  const k = ahkKey(fromCode);
  const prefix = mods.map((m) => PREFIX[m] ?? "").join("");
  // For single-letter keys use raw; for named keys wrap in nothing (AHK doesn't need braces on left side).
  return `${prefix}${k}`;
}

export function toAhk(file: RuleFile): string {
  const lines: string[] = [];
  lines.push("; --- AutoHotkey v2 ---");
  lines.push(`; ${file.title}`);
  lines.push(`; Generated from karabiner JSON: ${file.fileName}`);
  lines.push("#Requires AutoHotkey v2.0");
  lines.push("#SingleInstance Force");
  lines.push("");

  for (const r of file.rules) {
    lines.push(`; ${r.description || "(unnamed rule)"}`);
    for (const m of r.manipulators) {
      if (!m.from?.key_code) continue;
      const mods = fromMods(m);
      const trigger = hotkeyTrigger(m.from.key_code, mods);
      const tos = m.to ?? [];
      if (tos.length === 0) {
        lines.push(`${trigger}:: Return`);
        continue;
      }
      const t = tos[0];
      if (t.shell_command) {
        const cmd = t.shell_command.replace(/"/g, '`"');
        lines.push(`${trigger}:: RunWait "${cmd}",, "Hide"`);
        continue;
      }
      if (t.key_code) {
        const toMods = Array.isArray(t.modifiers)
          ? (t.modifiers as Modifier[])
          : ((t.modifiers?.mandatory ?? []) as Modifier[]);
        const payload = sendKey(t.key_code, toMods);
        lines.push(`${trigger}:: Send "${payload}"`);
      }
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
