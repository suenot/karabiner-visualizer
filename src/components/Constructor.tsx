"use client";

import { useEffect, useMemo, useState } from "react";
import { normalizeRuleFile, type RuleFile } from "@/lib/karabiner";
import { pickVariant, type Variant } from "@/lib/keyboard-layout";
import { buildLayers, bindingsForLayer, collectKeyCodes } from "@/lib/layers";
import { Keyboard } from "./Keyboard";
import { JsonViewer } from "./JsonViewer";
import { GALLERY, type GalleryItem } from "@/lib/gallery";

type Parsed =
  | { ok: true; file: RuleFile }
  | { ok: false; error: string };

function parseInput(name: string, src: string): Parsed {
  try {
    const data = JSON.parse(src);
    const file = normalizeRuleFile(name, data, src);
    if (file.rules.length === 0) {
      return { ok: false, error: "Parsed, but no rules with manipulators found." };
    }
    return { ok: true, file };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function parseGitHubUrl(input: string): { repo: string; branch: string; path: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // https://raw.githubusercontent.com/owner/repo/branch/path
  let m = trimmed.match(
    /^https?:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/,
  );
  if (m) return { repo: `${m[1]}/${m[2]}`, branch: m[3], path: m[4] };

  // https://github.com/owner/repo/blob/branch/path
  m = trimmed.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/,
  );
  if (m) return { repo: `${m[1]}/${m[2]}`, branch: m[3], path: m[4] };

  return null;
}

export function Constructor() {
  const [name, setName] = useState("draft.json");
  const [source, setSource] = useState(GALLERY[0].source);
  const [activeLayerIdx, setActiveLayerIdx] = useState(0);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState<"idle" | "loading" | "error">("idle");
  const [importError, setImportError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(GALLERY[0].id);
  const [variantOverride, setVariantOverride] = useState<Variant | "auto">(
    "auto",
  );

  // Restore from localStorage on mount. setState-in-effect is intentional
  // here: localStorage is browser-only, so we can't read it during render.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("karabiner-visualizer:draft");
      const savedName = localStorage.getItem("karabiner-visualizer:draft-name");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setSource(saved);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedName) setName(savedName);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setActivePreset(null);
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  // Persist on change.
  useEffect(() => {
    try {
      localStorage.setItem("karabiner-visualizer:draft", source);
      localStorage.setItem("karabiner-visualizer:draft-name", name);
    } catch {
      /* ignore */
    }
  }, [source, name]);

  // Restore + persist the keyboard variant override.
  useEffect(() => {
    try {
      const v = localStorage.getItem("karabiner-visualizer:variant");
      if (v === "ansi" || v === "iso" || v === "auto") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVariantOverride(v);
      }
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("karabiner-visualizer:variant", variantOverride);
    } catch {
      /* ignore */
    }
  }, [variantOverride]);

  const parsed = useMemo(() => parseInput(name, source), [name, source]);

  const layers = useMemo(
    () => (parsed.ok ? buildLayers(parsed.file) : []),
    [parsed],
  );
  const layer = layers[Math.min(activeLayerIdx, Math.max(0, layers.length - 1))];
  const bindings = useMemo(
    () => (layer ? bindingsForLayer(layer) : {}),
    [layer],
  );
  const autoVariant = useMemo<Variant>(
    () => (parsed.ok ? pickVariant(collectKeyCodes(parsed.file)) : "ansi"),
    [parsed],
  );
  const variant: Variant =
    variantOverride === "auto" ? autoVariant : variantOverride;

  const loadPreset = (item: GalleryItem) => {
    setSource(item.source);
    setName(item.fileName);
    setActiveLayerIdx(0);
    setActivePreset(item.id);
  };

  const onImport = async () => {
    setImportError(null);
    const parsedUrl = parseGitHubUrl(importUrl);
    if (!parsedUrl) {
      // Treat as a direct URL.
      try {
        setImporting("loading");
        const res = await fetch(importUrl.trim());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const txt = await res.text();
        setSource(txt);
        const u = new URL(importUrl.trim());
        const last = u.pathname.split("/").pop() || "imported.json";
        setName(last);
        setActivePreset(null);
        setActiveLayerIdx(0);
        setImporting("idle");
      } catch (e) {
        setImporting("error");
        setImportError(e instanceof Error ? e.message : String(e));
      }
      return;
    }
    const { repo, branch, path } = parsedUrl;
    const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
    try {
      setImporting("loading");
      const res = await fetch(rawUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const txt = await res.text();
      setSource(txt);
      setName(path.split("/").pop() ?? "imported.json");
      setActivePreset(null);
      setActiveLayerIdx(0);
      setImporting("idle");
    } catch (e) {
      setImporting("error");
      setImportError(e instanceof Error ? e.message : String(e));
    }
  };

  const onDownload = () => {
    const blob = new Blob([source], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onReset = () => {
    if (!confirm("Discard current draft and load the first preset?")) return;
    loadPreset(GALLERY[0]);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Gallery presets — grouped */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400">
          Gallery
        </span>
        {Object.entries(
          GALLERY.reduce<Record<string, GalleryItem[]>>((acc, g) => {
            const key = g.group ?? "Other";
            (acc[key] ??= []).push(g);
            return acc;
          }, {}),
        ).map(([group, items]) => (
          <div key={group} className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
              {group}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {items.map((g) => (
                <button
                  key={g.id}
                  onClick={() => loadPreset(g)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition ring-1 ${
                    activePreset === g.id
                      ? "bg-zinc-100 text-zinc-900 ring-zinc-200"
                      : "bg-zinc-900 text-zinc-200 ring-zinc-800 hover:bg-zinc-800"
                  }`}
                  title={g.note}
                >
                  {g.title}
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-zinc-500">
          Hover a chip to see what it does. Click to load — your draft is
          replaced (saved in localStorage).
        </p>
      </div>

      {/* Import from URL */}
      <div className="flex flex-col gap-2 rounded-xl ring-1 ring-zinc-800 bg-zinc-950/40 p-3">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
          Import from GitHub URL
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://github.com/owner/repo/blob/main/rule.json"
            className="flex-1 min-w-[260px] bg-zinc-900 text-zinc-100 rounded-md px-3 py-1.5 text-sm font-mono ring-1 ring-zinc-800 focus:ring-emerald-500 outline-none"
          />
          <button
            onClick={onImport}
            disabled={!importUrl.trim() || importing === "loading"}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {importing === "loading" ? "Loading…" : "Load"}
          </button>
        </div>
        {importError && (
          <p className="text-xs text-red-400 font-mono">{importError}</p>
        )}
      </div>

      {/* Editor + Preview split */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-5">
        {/* Editor pane */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900 text-zinc-100 rounded-md px-3 py-1.5 text-sm font-mono ring-1 ring-zinc-800 focus:ring-emerald-500 outline-none w-48"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={onDownload}
                className="text-xs font-medium px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition"
              >
                ⬇ Download JSON
              </button>
              <button
                onClick={onReset}
                className="text-xs px-2 py-1.5 rounded-md bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800 transition"
                title="Reset to first preset"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="relative rounded-xl ring-1 ring-zinc-800 bg-[#0d1117] overflow-hidden">
            <textarea
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setActivePreset(null);
              }}
              spellCheck={false}
              className="w-full h-[520px] bg-transparent text-zinc-100 font-mono text-[12.5px] leading-[1.55] p-3 outline-none resize-none"
            />
          </div>
          {parsed.ok ? (
            <p className="text-xs text-emerald-400 font-mono">
              ✓ {parsed.file.rules.length} rule(s) · {layers.length} layer(s) ·{" "}
              {variant.toUpperCase()}
            </p>
          ) : (
            <p className="text-xs text-red-400 font-mono">✗ {parsed.error}</p>
          )}
        </div>

        {/* Preview pane */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 min-h-[34px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">
                Hold
              </span>
              {layers.length === 0 && (
                <span className="text-xs text-zinc-500">— no layers —</span>
              )}
              {layers.map((l, i) => (
                <button
                  key={l.key}
                  onClick={() => setActiveLayerIdx(i)}
                  className={`px-3 py-1.5 rounded-md text-sm font-mono transition ${
                    i === activeLayerIdx
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
            <div
              className="inline-flex rounded-md ring-1 ring-zinc-800 overflow-hidden text-[11px] font-mono"
              role="group"
              aria-label="Keyboard layout"
            >
              {(["auto", "ansi", "iso"] as const).map((v) => {
                const active = variantOverride === v;
                const label =
                  v === "auto" ? `Auto (${autoVariant.toUpperCase()})` : v.toUpperCase();
                return (
                  <button
                    key={v}
                    onClick={() => setVariantOverride(v)}
                    className={`px-2.5 py-1.5 transition ${
                      active
                        ? "bg-zinc-100 text-zinc-900"
                        : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    }`}
                    title={
                      v === "auto"
                        ? "Pick ANSI or ISO based on used key codes"
                        : `Force ${v.toUpperCase()} layout`
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl bg-zinc-950/60 ring-1 ring-zinc-800 p-5">
            <Keyboard
              bindings={bindings}
              activeModifiers={layer?.modifiers ?? []}
              variant={variant}
            />
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
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
            </div>
          </div>
        </div>
      </div>

      {/* Multi-target export (Karabiner, kanata, ahk, keyd, xremap, kmonad) */}
      {parsed.ok && (
        <JsonViewer file={parsed.file} showDownload={false} />
      )}
    </div>
  );
}
