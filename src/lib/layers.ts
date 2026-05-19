import type { Manipulator, RuleFile } from "./karabiner";
import { fromMods, modKey, modLabel, formatTo } from "./format";
import type { Bindings } from "@/components/Keyboard";

export type Layer = {
  key: string;
  label: string;
  modifiers: string[];
  manipulators: Manipulator[];
};

export function buildLayers(file: RuleFile): Layer[] {
  const groups = new Map<string, Layer>();
  for (const rule of file.rules) {
    for (const m of rule.manipulators) {
      if (!m.from?.key_code) continue;
      const mods = fromMods(m);
      const k = modKey(mods);
      if (!groups.has(k)) {
        groups.set(k, {
          key: k,
          label: modLabel(mods),
          modifiers: mods,
          manipulators: [],
        });
      }
      groups.get(k)!.manipulators.push(m);
    }
  }
  return [...groups.values()].sort((a, b) => {
    if (a.key === "_none") return -1;
    if (b.key === "_none") return 1;
    return a.label.localeCompare(b.label);
  });
}

export function bindingsForLayer(layer: Layer): Bindings {
  const out: Bindings = {};
  for (const m of layer.manipulators) {
    const code = m.from.key_code!;
    out[code] = formatTo(m.to);
  }
  return out;
}

export function collectKeyCodes(file: RuleFile): Set<string> {
  const s = new Set<string>();
  for (const r of file.rules) {
    for (const m of r.manipulators) {
      if (m.from?.key_code) s.add(m.from.key_code);
      for (const t of m.to ?? []) if (t.key_code) s.add(t.key_code);
    }
  }
  return s;
}
