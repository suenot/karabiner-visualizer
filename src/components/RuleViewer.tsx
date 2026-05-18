"use client";

import { useMemo, useState } from "react";
import {
  type Manipulator,
  type Rule,
  type RuleFile,
  extractModifiers,
} from "@/lib/karabiner";
import { Keyboard, type Highlight } from "./Keyboard";

const MOD_LABEL: Record<string, string> = {
  left_command: "⌘ L",
  right_command: "⌘ R",
  command: "⌘",
  left_option: "⌥ L",
  right_option: "⌥ R",
  option: "⌥",
  left_control: "⌃ L",
  right_control: "⌃ R",
  control: "⌃",
  left_shift: "⇧ L",
  right_shift: "⇧ R",
  shift: "⇧",
  fn: "fn",
  caps_lock: "⇪",
  any: "any",
};

function manipulatorHighlights(m: Manipulator): Highlight[] {
  const hs: Highlight[] = [];
  if (m.from?.key_code) hs.push({ code: m.from.key_code, kind: "from" });
  for (const mod of m.from?.modifiers?.mandatory ?? []) {
    hs.push({ code: mod, kind: "from" });
  }
  for (const t of m.to ?? []) {
    if (t.key_code) hs.push({ code: t.key_code, kind: "to" });
    const mods = Array.isArray(t.modifiers)
      ? t.modifiers
      : t.modifiers?.mandatory ?? [];
    for (const mod of mods) hs.push({ code: mod, kind: "to" });
  }
  return hs;
}

function ruleHighlights(r: Rule): Highlight[] {
  return r.manipulators.flatMap(manipulatorHighlights);
}

function ModBadge({ mod, kind }: { mod: string; kind: "from" | "to" }) {
  const tone =
    kind === "from"
      ? "bg-red-600 text-white"
      : "bg-emerald-600 text-white";
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${tone}`}
    >
      {MOD_LABEL[mod] ?? mod}
    </span>
  );
}

function KeyChip({
  code,
  kind,
}: {
  code: string;
  kind: "from" | "to";
}) {
  const tone =
    kind === "from"
      ? "bg-red-600 text-white"
      : "bg-emerald-600 text-white";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-xs font-semibold ${tone}`}
    >
      {code}
    </span>
  );
}

function ManipulatorRow({ m }: { m: Manipulator }) {
  const fromMods = extractModifiers(m.from);
  return (
    <div className="flex flex-wrap items-center gap-2 py-2 text-sm border-t border-zinc-800/60 first:border-t-0">
      <div className="flex flex-wrap items-center gap-1">
        {fromMods.mandatory.map((mod) => (
          <ModBadge key={`fm-${mod}`} mod={mod} kind="from" />
        ))}
        {m.from?.key_code && <KeyChip code={m.from.key_code} kind="from" />}
      </div>
      <span className="text-zinc-500">→</span>
      <div className="flex flex-wrap items-center gap-1">
        {(m.to ?? []).map((t, i) => {
          const tMods = Array.isArray(t.modifiers)
            ? t.modifiers
            : t.modifiers?.mandatory ?? [];
          if (t.shell_command) {
            return (
              <span
                key={`sh-${i}`}
                className="inline-flex items-center max-w-md px-2 py-0.5 rounded font-mono text-xs ring-1 ring-amber-500/40 bg-amber-500/15 text-amber-200 truncate"
                title={t.shell_command}
              >
                $ {t.shell_command}
              </span>
            );
          }
          return (
            <span key={`to-${i}`} className="inline-flex items-center gap-1">
              {tMods.map((mod) => (
                <ModBadge key={`tm-${i}-${mod}`} mod={mod} kind="to" />
              ))}
              {t.key_code && <KeyChip code={t.key_code} kind="to" />}
            </span>
          );
        })}
        {(!m.to || m.to.length === 0) && (
          <span className="text-zinc-500 italic text-xs">(no output)</span>
        )}
      </div>
    </div>
  );
}

export function RuleViewer({ files }: { files: RuleFile[] }) {
  const nonEmpty = useMemo(() => files.filter((f) => f.rules.length > 0), [files]);
  const [activeFile, setActiveFile] = useState(0);
  const [activeRule, setActiveRule] = useState(0);
  const [hoverRule, setHoverRule] = useState<number | null>(null);

  if (nonEmpty.length === 0) {
    return (
      <div className="p-8 text-zinc-400">
        No rule files found in <code>../karabiner/</code>.
      </div>
    );
  }

  const file = nonEmpty[Math.min(activeFile, nonEmpty.length - 1)];
  const rule = file.rules[Math.min(activeRule, file.rules.length - 1)];
  const showIdx = hoverRule ?? activeRule;
  const shownRule = file.rules[Math.min(showIdx, file.rules.length - 1)] ?? rule;
  const highlights = ruleHighlights(shownRule);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        {nonEmpty.map((f, i) => (
          <button
            key={f.fileName}
            onClick={() => {
              setActiveFile(i);
              setActiveRule(0);
              setHoverRule(null);
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-6">
        <div className="rounded-xl bg-zinc-950/60 ring-1 ring-zinc-800 p-4">
          <Keyboard highlights={highlights} />
          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-600" /> from (trigger)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-600" /> to (output)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-violet-600" /> both
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">
            Rules in {file.fileName}
          </h3>
          <ul className="flex flex-col gap-1.5 max-h-[560px] overflow-auto pr-1">
            {file.rules.map((r, i) => {
              const active = i === activeRule;
              return (
                <li key={i}>
                  <button
                    onClick={() => setActiveRule(i)}
                    onMouseEnter={() => setHoverRule(i)}
                    onMouseLeave={() => setHoverRule(null)}
                    className={`w-full text-left p-3 rounded-lg ring-1 transition ${
                      active
                        ? "bg-zinc-100 text-zinc-900 ring-zinc-200"
                        : "bg-zinc-950/60 text-zinc-200 ring-zinc-800 hover:ring-zinc-700"
                    }`}
                  >
                    <div
                      className={`text-sm font-medium ${
                        active ? "text-zinc-900" : "text-zinc-100"
                      }`}
                    >
                      {r.description || "(unnamed rule)"}
                    </div>
                    <div className="mt-1.5 flex flex-col gap-0.5">
                      {r.manipulators.map((m, mi) => (
                        <ManipulatorRow key={mi} m={m} />
                      ))}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
