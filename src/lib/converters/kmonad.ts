import type { RuleFile, Manipulator, Modifier } from "../karabiner";
import { fromMods } from "../format";
import { toKey } from "./keymap";

function km(code: string): string {
  return toKey(code, "kmonad") ?? `;; <no-kmonad:${code}>`;
}

function emitTo(m: Manipulator): string {
  const tos = m.to ?? [];
  if (tos.length === 0) return "XX";
  const t = tos[0];
  if (t.shell_command) {
    return `(cmd-button "${t.shell_command.replace(/"/g, '\\"')}")`;
  }
  if (!t.key_code) return "XX";
  const tmods = Array.isArray(t.modifiers)
    ? (t.modifiers as Modifier[])
    : ((t.modifiers?.mandatory ?? []) as Modifier[]);
  const key = km(t.key_code);
  if (tmods.length === 0) return key;
  const modKeys = tmods.map((mm) => km(mm));
  // KMonad: chord using (around ...) wrappers; simplest form is C-A-key syntax
  // via `tap-macro` to send modifier+key in sequence.
  return `(tap-macro ${modKeys.join(" ")} ${key})`;
}

function layerName(mods: Modifier[]): string {
  if (mods.length === 0) return "base";
  return mods.join("+").replace(/_/g, "-");
}

export function toKmonad(file: RuleFile): string {
  const lines: string[] = [];
  lines.push(";; " + file.title);
  lines.push(";; Generated from karabiner JSON: " + file.fileName);
  lines.push(";; Add to your kmonad config alongside an appropriate (defcfg ...).");
  lines.push("");

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

  // Collect every key we touch (sources + modifier triggers)
  const srcCodes = new Set<string>();
  const modTriggers = new Set<string>();
  for (const [modsKey, ms] of byMods) {
    if (modsKey) modsKey.split("+").forEach((m) => modTriggers.add(m));
    for (const m of ms) {
      if (m.from?.key_code) srcCodes.add(m.from.key_code);
    }
  }
  modTriggers.forEach((m) => srcCodes.add(m));
  const srcList = [...srcCodes];

  lines.push("(defsrc");
  lines.push("  " + srcList.map((c) => km(c)).join(" "));
  lines.push(")");
  lines.push("");

  if (layerGroups.length > 0) {
    lines.push("(defalias");
    for (const [modsKey] of layerGroups) {
      const mods = modsKey.split("+") as Modifier[];
      const layer = layerName(mods);
      const trigger = km(mods[0]);
      lines.push(`  ${trigger}-layer (tap-hold 200 ${trigger} (layer-toggle ${layer}))`);
    }
    lines.push(")");
    lines.push("");
  }

  lines.push("(deflayer base");
  const baseCells = srcList.map((c) => {
    const isTrigger = [...layerGroups].some(([modsKey]) => {
      const mods = modsKey.split("+");
      return mods[0] === c;
    });
    if (isTrigger) return `@${km(c)}-layer`;
    const m = noModMs.find((mm) => mm.from.key_code === c);
    if (m) return emitTo(m);
    return km(c);
  });
  lines.push("  " + baseCells.join(" "));
  lines.push(")");
  lines.push("");

  for (const [modsKey, ms] of layerGroups) {
    const mods = modsKey.split("+") as Modifier[];
    const layer = layerName(mods);
    lines.push(`(deflayer ${layer}`);
    const cells = srcList.map((c) => {
      if (mods.includes(c as Modifier)) return km(c);
      const m = ms.find((mm) => mm.from.key_code === c);
      if (m) return emitTo(m);
      return "_";
    });
    lines.push("  " + cells.join(" "));
    lines.push(")");
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
