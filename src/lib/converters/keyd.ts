import type { RuleFile, Manipulator, Modifier } from "../karabiner";
import { fromMods } from "../format";
import { toKey } from "./keymap";

function kk(code: string): string {
  return toKey(code, "keyd") ?? `# <no-keyd:${code}>`;
}

function emitTo(m: Manipulator): string {
  const tos = m.to ?? [];
  if (tos.length === 0) return "noop";
  const t = tos[0];
  if (t.shell_command) {
    return `command(${t.shell_command})`;
  }
  if (!t.key_code) return "noop";
  const tmods = Array.isArray(t.modifiers)
    ? (t.modifiers as Modifier[])
    : ((t.modifiers?.mandatory ?? []) as Modifier[]);
  const key = kk(t.key_code);
  if (tmods.length === 0) return key;
  // keyd inline modifier notation: e.g. C-left = ctrl+left
  const prefix = tmods
    .map((m) => {
      switch (m) {
        case "shift":
        case "left_shift":
        case "right_shift":
          return "S-";
        case "control":
        case "left_control":
        case "right_control":
          return "C-";
        case "option":
        case "left_option":
        case "right_option":
          return "A-";
        case "command":
        case "left_command":
        case "right_command":
          return "M-";
        default:
          return "";
      }
    })
    .join("");
  return `${prefix}${key}`;
}

export function toKeyd(file: RuleFile): string {
  const lines: string[] = [];
  lines.push("# " + file.title);
  lines.push("# Generated from karabiner JSON: " + file.fileName);
  lines.push("# Usage: copy under /etc/keyd/<name>.conf, then `keyd reload`");
  lines.push("");
  lines.push("[ids]");
  lines.push("*");
  lines.push("");

  // Group manipulators by modifier set.
  const byMods = new Map<string, Manipulator[]>();
  for (const r of file.rules) {
    for (const m of r.manipulators) {
      if (!m.from?.key_code) continue;
      const mods = fromMods(m);
      const key = mods.join("+");
      if (!byMods.has(key)) byMods.set(key, []);
      byMods.get(key)!.push(m);
    }
  }

  const noModMs = byMods.get("") ?? [];
  const layerGroups = [...byMods.entries()].filter(([k]) => k !== "");

  // [main]: direct (no-modifier) remaps + layer triggers
  lines.push("[main]");
  for (const m of noModMs) {
    const fromKey = kk(m.from.key_code!);
    lines.push(`${fromKey} = ${emitTo(m)}`);
  }
  // Layer triggers
  for (const [modsKey] of layerGroups) {
    const mods = modsKey.split("+");
    const triggerKey = kk(mods[0]);
    const layerName = modsKey.replace(/_/g, "-");
    lines.push(`${triggerKey} = layer(${layerName})`);
  }
  lines.push("");

  // Layer definitions
  for (const [modsKey, ms] of layerGroups) {
    const layerName = modsKey.replace(/_/g, "-");
    lines.push(`[${layerName}]`);
    for (const m of ms) {
      const fromKey = kk(m.from.key_code!);
      lines.push(`${fromKey} = ${emitTo(m)}`);
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
