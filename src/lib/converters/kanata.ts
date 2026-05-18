import type { RuleFile, Manipulator, Modifier } from "../karabiner";
import { fromMods } from "../format";
import { toKey } from "./keymap";

function k(code: string): string {
  return toKey(code, "kanata") ?? `?${code}`;
}

function modName(mod: Modifier): string {
  return mod.replace(/_/g, "-");
}

function layerNameFor(mods: Modifier[]): string {
  if (mods.length === 0) return "base";
  return mods.map(modName).join("+");
}

function emitTo(m: Manipulator): string {
  const tos = m.to ?? [];
  if (tos.length === 0) return "XX";
  const parts = tos
    .map((t) => {
      if (t.shell_command) return `(cmd "${t.shell_command.replace(/"/g, '\\"')}")`;
      const keyCode = t.key_code ? k(t.key_code) : null;
      if (!keyCode) return "XX";
      const tmods = Array.isArray(t.modifiers)
        ? (t.modifiers as Modifier[])
        : ((t.modifiers?.mandatory ?? []) as Modifier[]);
      if (tmods.length === 0) return keyCode;
      // (multi lmet key) emits both
      const modKeys = tmods.map((mm) => k(mm));
      return `(multi ${modKeys.join(" ")} ${keyCode})`;
    })
    .filter(Boolean);
  return parts.length === 1 ? parts[0] : `(multi ${parts.join(" ")})`;
}

export function toKanata(file: RuleFile): string {
  const lines: string[] = [];
  lines.push(`;; ${file.title}`);
  lines.push(
    `;; Generated from karabiner JSON: ${file.fileName}`,
    `;; Run: kanata --cfg this-file.kbd`,
    "",
  );
  lines.push("(defcfg");
  lines.push("  process-unmapped-keys yes");
  lines.push(")");
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

  // Source keys: every "from" key + every modifier used as trigger.
  const srcCodes = new Set<string>();
  const modKeys = new Set<string>();
  for (const [modsKey, ms] of byMods) {
    if (modsKey) modsKey.split("+").forEach((m) => modKeys.add(m));
    for (const m of ms) {
      if (m.from?.key_code) srcCodes.add(m.from.key_code);
    }
  }
  modKeys.forEach((m) => srcCodes.add(m));
  const srcList = [...srcCodes];

  lines.push("(defsrc");
  lines.push("  " + srcList.map((c) => k(c)).join(" "));
  lines.push(")");
  lines.push("");

  // Aliases for each modifier-triggered layer.
  if (layerGroups.length > 0) {
    lines.push("(defalias");
    for (const [modsKey] of layerGroups) {
      const mods = modsKey.split("+") as Modifier[];
      const layer = layerNameFor(mods);
      const trigger = k(mods[0]);
      lines.push(
        `  ${trigger}-layer (tap-hold-release 200 200 ${trigger} (layer-while-held ${layer}))`,
      );
    }
    lines.push(")");
    lines.push("");
  }

  // Base layer
  lines.push("(deflayer base");
  const baseCells = srcList.map((c) => {
    // If this key is a layer trigger, use the alias.
    const isTrigger = [...layerGroups].some(([modsKey]) => {
      const mods = modsKey.split("+");
      return mods[0] === c;
    });
    if (isTrigger) return `@${k(c)}-layer`;
    // If this key has a no-mod remap, use the to-spec.
    const m = noModMs.find((mm) => mm.from.key_code === c);
    if (m) return emitTo(m);
    return k(c);
  });
  lines.push("  " + baseCells.join(" "));
  lines.push(")");
  lines.push("");

  // Per-layer
  for (const [modsKey, ms] of layerGroups) {
    const mods = modsKey.split("+") as Modifier[];
    const layer = layerNameFor(mods);
    lines.push(`(deflayer ${layer}`);
    const cells = srcList.map((c) => {
      // Don't remap the modifier itself inside its layer.
      if (mods.includes(c as Modifier)) return k(c);
      const m = ms.find((mm) => mm.from.key_code === c);
      if (m) return emitTo(m);
      return "_"; // transparent in kanata
    });
    lines.push("  " + cells.join(" "));
    lines.push(")");
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
