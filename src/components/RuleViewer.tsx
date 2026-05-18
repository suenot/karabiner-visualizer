"use client";

import { useMemo, useState } from "react";
import type { Manipulator, RuleFile } from "@/lib/karabiner";
import { fromMods, modKey, modLabel, formatTo } from "@/lib/format";
import { Keyboard, type Bindings } from "./Keyboard";

type Layer = {
  key: string;
  label: string;
  modifiers: string[];
  manipulators: Manipulator[];
};

function buildLayers(file: RuleFile): Layer[] {
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
  // sort: no-mod first, then by label
  return [...groups.values()].sort((a, b) => {
    if (a.key === "_none") return -1;
    if (b.key === "_none") return 1;
    return a.label.localeCompare(b.label);
  });
}

function bindingsForLayer(layer: Layer): Bindings {
  const out: Bindings = {};
  for (const m of layer.manipulators) {
    const code = m.from.key_code!;
    const to = formatTo(m.to);
    out[code] = to;
  }
  return out;
}

export function RuleViewer({ files }: { files: RuleFile[] }) {
  const nonEmpty = useMemo(() => files.filter((f) => f.rules.length > 0), [files]);
  const [activeFile, setActiveFile] = useState(0);
  const [activeLayer, setActiveLayer] = useState(0);

  const file = nonEmpty[Math.min(activeFile, Math.max(0, nonEmpty.length - 1))];
  const layers = useMemo(() => (file ? buildLayers(file) : []), [file]);
  const layer = layers[Math.min(activeLayer, Math.max(0, layers.length - 1))];
  const bindings = useMemo(() => (layer ? bindingsForLayer(layer) : {}), [layer]);

  if (nonEmpty.length === 0 || !file || !layer) {
    return (
      <div className="p-8 text-zinc-400">
        No rule files found in <code>../karabiner/</code>.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* File tabs */}
      <div className="flex flex-wrap gap-1.5">
        {nonEmpty.map((f, i) => (
          <button
            key={f.fileName}
            onClick={() => {
              setActiveFile(i);
              setActiveLayer(0);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition ${
              i === activeFile
                ? "bg-zinc-100 text-zinc-900"
                : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            }`}
            title={f.fileName}
          >
            {f.title}
            <span className="ml-1.5 opacity-60">{f.rules.length}</span>
          </button>
        ))}
      </div>

      {/* Layer (modifier) tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">
          Hold
        </span>
        {layers.map((l, i) => (
          <button
            key={l.key}
            onClick={() => setActiveLayer(i)}
            className={`px-3 py-1.5 rounded-md text-sm font-mono transition ${
              i === activeLayer
                ? "bg-emerald-500 text-zinc-950"
                : "bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            {l.label}
            <span className="ml-1.5 opacity-70 text-xs">
              {l.manipulators.length}
            </span>
          </button>
        ))}
      </div>

      {/* Keyboard */}
      <div className="rounded-2xl bg-zinc-950/60 ring-1 ring-zinc-800 p-5">
        <Keyboard bindings={bindings} activeModifiers={layer?.modifiers ?? []} />
        <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600 ring-1 ring-emerald-300" />
            remapped key
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-700" /> shell command
          </span>
          <span className="text-zinc-500">
            Hover a key for its full mapping.
          </span>
        </div>
      </div>

      {/* Rule list (textual) */}
      <details className="rounded-xl ring-1 ring-zinc-800 bg-zinc-950/40">
        <summary className="cursor-pointer select-none px-4 py-2 text-xs uppercase tracking-wide text-zinc-400 font-semibold hover:text-zinc-200">
          Raw rules in {file.fileName} ({file.rules.length})
        </summary>
        <ul className="p-4 pt-1 flex flex-col gap-2">
          {file.rules.map((r, i) => (
            <li key={i} className="text-sm text-zinc-300">
              <div className="text-zinc-100 font-medium">
                {r.description || "(unnamed rule)"}
              </div>
              <ul className="pl-3 mt-1 flex flex-col gap-0.5 text-xs font-mono text-zinc-400">
                {r.manipulators.map((m, mi) => {
                  const mods = fromMods(m);
                  const t = formatTo(m.to);
                  return (
                    <li key={mi}>
                      <span className="text-zinc-500">
                        {mods.length
                          ? mods.map((x) => x).join(" + ") + " + "
                          : ""}
                      </span>
                      <span className="text-red-300">
                        {m.from?.key_code ?? "?"}
                      </span>
                      <span className="text-zinc-500 mx-1.5">→</span>
                      <span
                        className={t.isShell ? "text-amber-300" : "text-emerald-300"}
                      >
                        {t.full}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
