"use client";

import { useMemo, useState } from "react";
import type { Manipulator, RuleFile } from "@/lib/karabiner";
import { fromMods, modKey, modLabel, formatTo } from "@/lib/format";
import { pickVariant } from "@/lib/keyboard-layout";
import { notesFor, statusOf } from "@/lib/descriptions";
import { Keyboard, type Bindings } from "./Keyboard";
import { JsonViewer } from "./JsonViewer";

const GITHUB_RAW =
  "https://raw.githubusercontent.com/suenot/karabiner/master";
const GITHUB_BLOB = "https://github.com/suenot/karabiner/blob/master";

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
    out[code] = formatTo(m.to);
  }
  return out;
}

function collectCodes(file: RuleFile): Set<string> {
  const s = new Set<string>();
  for (const r of file.rules) {
    for (const m of r.manipulators) {
      if (m.from?.key_code) s.add(m.from.key_code);
      for (const t of m.to ?? []) if (t.key_code) s.add(t.key_code);
    }
  }
  return s;
}

export function RuleViewer({ files }: { files: RuleFile[] }) {
  const nonEmpty = useMemo(() => files.filter((f) => f.rules.length > 0), [files]);
  const defaultFileIdx = useMemo(() => {
    const firstActive = nonEmpty.findIndex(
      (f) => statusOf(f.fileName) === "active",
    );
    return firstActive >= 0 ? firstActive : 0;
  }, [nonEmpty]);
  const [activeFile, setActiveFile] = useState(defaultFileIdx);
  const [activeLayer, setActiveLayer] = useState(0);

  const file = nonEmpty[Math.min(activeFile, Math.max(0, nonEmpty.length - 1))];
  const layers = useMemo(() => (file ? buildLayers(file) : []), [file]);
  const layer = layers[Math.min(activeLayer, Math.max(0, layers.length - 1))];
  const bindings = useMemo(() => (layer ? bindingsForLayer(layer) : {}), [layer]);
  const variant = useMemo(
    () => (file ? pickVariant(collectCodes(file)) : "ansi"),
    [file],
  );
  const notes = file ? notesFor(file.fileName) : undefined;

  if (nonEmpty.length === 0 || !file || !layer) {
    return (
      <div className="p-8 text-zinc-400">
        No rule files loaded from{" "}
        <a
          href="https://github.com/suenot/karabiner"
          className="underline decoration-zinc-600 hover:decoration-zinc-300"
        >
          suenot/karabiner
        </a>
        . Check the network panel for GitHub API errors.
      </div>
    );
  }

  const rawUrl = `${GITHUB_RAW}/${file.fileName}`;
  const blobUrl = `${GITHUB_BLOB}/${file.fileName}`;

  return (
    <div className="flex flex-col gap-5">
      {/* File tabs, grouped by status */}
      {(["active", "experimental"] as const).map((group) => {
        const items = nonEmpty
          .map((f, i) => ({ f, i }))
          .filter(({ f }) => statusOf(f.fileName) === group);
        if (items.length === 0) return null;
        const groupLabel = group === "active" ? "In use" : "Experimental";
        return (
          <div key={group} className="flex flex-col gap-1.5">
            <span
              className={`text-[10px] uppercase tracking-wider font-semibold ${
                group === "active" ? "text-emerald-400" : "text-zinc-500"
              }`}
            >
              {groupLabel}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {items.map(({ f, i }) => (
                <button
                  key={f.fileName}
                  onClick={() => {
                    setActiveFile(i);
                    setActiveLayer(0);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition ring-1 ${
                    i === activeFile
                      ? "bg-zinc-100 text-zinc-900 ring-zinc-200"
                      : group === "active"
                        ? "bg-zinc-900 text-zinc-200 ring-emerald-700/40 hover:bg-zinc-800"
                        : "bg-zinc-900/60 text-zinc-400 ring-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                  title={f.fileName}
                >
                  {f.title}
                  <span className="ml-1.5 opacity-60">{f.rules.length}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* File header: title + description + download */}
      <div className="rounded-xl ring-1 ring-zinc-800 bg-zinc-950/40 p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-zinc-100">
                {notes?.headline ?? file.title}
              </h2>
              <span
                className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ring-1 ${
                  statusOf(file.fileName) === "active"
                    ? "ring-emerald-500/40 text-emerald-300 bg-emerald-900/30"
                    : "ring-zinc-700 text-zinc-400 bg-zinc-900"
                }`}
                title={
                  statusOf(file.fileName) === "active"
                    ? "In daily use"
                    : "Experimental — may not be polished"
                }
              >
                {statusOf(file.fileName) === "active"
                  ? "in use"
                  : "experimental"}
              </span>
              <span className="text-xs font-mono text-zinc-500 bg-zinc-900 ring-1 ring-zinc-800 px-2 py-0.5 rounded">
                {file.fileName}
              </span>
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded ring-1 ${
                  variant === "iso"
                    ? "ring-amber-600/40 text-amber-300 bg-amber-900/30"
                    : "ring-zinc-700 text-zinc-400 bg-zinc-900"
                }`}
                title={
                  variant === "iso"
                    ? "ISO layout (uses non_us_backslash)"
                    : "ANSI layout"
                }
              >
                {variant.toUpperCase()}
              </span>
            </div>
            {notes?.body && (
              <p className="mt-2 text-sm text-zinc-300 leading-relaxed max-w-3xl">
                {notes.body}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={blobUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-zinc-400 hover:text-zinc-100 underline decoration-zinc-700 px-2 py-1"
            >
              view on GitHub ↗
            </a>
            <a
              href={rawUrl}
              download={file.fileName}
              className="text-xs font-medium px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition"
              title={`Download ${file.fileName}`}
            >
              ⬇ Download JSON
            </a>
          </div>
        </div>
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
        <Keyboard
          bindings={bindings}
          activeModifiers={layer?.modifiers ?? []}
          variant={variant}
        />
        <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600 ring-1 ring-emerald-300" />
            remapped key
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-700" /> shell command
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-700 ring-1 ring-blue-300" />
            modifier to hold
          </span>
          <span className="text-zinc-500">
            Hover a key for its full mapping.
          </span>
        </div>
      </div>

      {/* Raw rules: textual summary + JSON source */}
      <details className="rounded-xl ring-1 ring-zinc-800 bg-zinc-950/40">
        <summary className="cursor-pointer select-none px-4 py-2 text-xs uppercase tracking-wide text-zinc-400 font-semibold hover:text-zinc-200">
          Rule summary ({file.rules.length})
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
                        {mods.length ? mods.join(" + ") + " + " : ""}
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

      {/* JSON source viewer */}
      {file.raw && <JsonViewer source={file.raw} fileName={file.fileName} />}
    </div>
  );
}
