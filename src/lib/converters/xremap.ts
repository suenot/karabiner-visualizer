import type { RuleFile, Manipulator, Modifier } from "../karabiner";
import { fromMods } from "../format";
import { toKey } from "./keymap";

const MOD_PREFIX: Partial<Record<Modifier, string>> = {
  left_shift: "Shift",
  right_shift: "Shift",
  shift: "Shift",
  left_control: "Control",
  right_control: "Control",
  control: "Control",
  left_option: "Alt",
  right_option: "Alt",
  option: "Alt",
  left_command: "Super",
  right_command: "Super",
  command: "Super",
};

function x(code: string): string {
  return toKey(code, "xremap") ?? code;
}

function emitTo(m: Manipulator): string {
  const tos = m.to ?? [];
  if (tos.length === 0) return '""';
  const t = tos[0];
  if (t.shell_command) {
    return JSON.stringify(`launch: [\"bash\", \"-c\", \"${t.shell_command.replace(/"/g, '\\"')}\"]`);
  }
  if (!t.key_code) return '""';
  const tmods = Array.isArray(t.modifiers)
    ? (t.modifiers as Modifier[])
    : ((t.modifiers?.mandatory ?? []) as Modifier[]);
  const key = x(t.key_code);
  if (tmods.length === 0) return key;
  const prefix = [...new Set(tmods.map((mm) => MOD_PREFIX[mm]).filter(Boolean) as string[])].join("-");
  return prefix ? `${prefix}-${key}` : key;
}

export function toXremap(file: RuleFile): string {
  const lines: string[] = [];
  lines.push(`# ${file.title}`);
  lines.push(`# Generated from karabiner JSON: ${file.fileName}`);
  lines.push("# Save as ~/.config/xremap/config.yml fragment");
  lines.push("");

  // Split into modmap (single key -> single key) and keymap (with modifiers).
  const modmap: [string, string][] = [];
  const keymap: { from: string; to: string }[] = [];

  for (const r of file.rules) {
    for (const m of r.manipulators) {
      if (!m.from?.key_code) continue;
      const mods = fromMods(m);
      const fromKey = x(m.from.key_code);
      const to = emitTo(m);
      if (mods.length === 0 && (m.to?.length === 1) && (m.to?.[0].key_code) && !m.to?.[0].modifiers) {
        modmap.push([fromKey, to]);
      } else {
        const prefix = [...new Set(mods.map((mm) => MOD_PREFIX[mm]).filter(Boolean) as string[])].join("-");
        const fromExpr = prefix ? `${prefix}-${fromKey}` : fromKey;
        keymap.push({ from: fromExpr, to });
      }
    }
  }

  if (modmap.length > 0) {
    lines.push("modmap:");
    lines.push(`  - name: ${JSON.stringify(file.title)}`);
    lines.push("    remap:");
    for (const [from, to] of modmap) {
      lines.push(`      ${from}: ${to}`);
    }
    lines.push("");
  }

  if (keymap.length > 0) {
    lines.push("keymap:");
    lines.push(`  - name: ${JSON.stringify(file.title)}`);
    lines.push("    remap:");
    for (const { from, to } of keymap) {
      lines.push(`      ${from}: ${to}`);
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
