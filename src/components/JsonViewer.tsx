"use client";

import { useMemo, useState } from "react";
import type { RuleFile } from "@/lib/karabiner";
import { TARGETS, type TargetId } from "@/lib/converters";

type Tone =
  | "key"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "punct"
  | "comment";

const toneClass: Record<Tone, string> = {
  key: "text-sky-300",
  string: "text-amber-200",
  number: "text-emerald-300",
  boolean: "text-pink-300",
  null: "text-pink-300",
  punct: "text-zinc-500",
  comment: "text-zinc-500 italic",
};

type Language = "json" | "lisp" | "ini" | "yaml" | "ahk";

function highlight(src: string, lang: Language): React.ReactNode[] {
  if (lang === "json") return highlightJson(src);
  if (lang === "lisp") return highlightLine(src, /^\s*(;;).*$/);
  if (lang === "ini") return highlightIni(src);
  if (lang === "yaml") return highlightYaml(src);
  if (lang === "ahk") return highlightLine(src, /^\s*(;).*$/);
  return [src];
}

function highlightJson(src: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let i = 0;
  let n = 0;
  const push = (text: string, tone: Tone) => {
    if (!text) return;
    out.push(
      <span key={n++} className={toneClass[tone]}>
        {text}
      </span>,
    );
  };
  while (i < src.length) {
    const c = src[i];
    if (c === '"') {
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === "\\") {
          j += 2;
          continue;
        }
        if (src[j] === '"') break;
        j++;
      }
      const tok = src.slice(i, j + 1);
      let k = j + 1;
      while (k < src.length && /\s/.test(src[k])) k++;
      const isKey = src[k] === ":";
      push(tok, isKey ? "key" : "string");
      i = j + 1;
      continue;
    }
    if (/[-0-9]/.test(c)) {
      const m = src.slice(i).match(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/);
      if (m) {
        push(m[0], "number");
        i += m[0].length;
        continue;
      }
    }
    if (/[a-z]/.test(c)) {
      const m = src.slice(i).match(/^(true|false|null)/);
      if (m) {
        push(m[0], m[0] === "null" ? "null" : "boolean");
        i += m[0].length;
        continue;
      }
    }
    if (/\s/.test(c)) {
      let j = i;
      while (j < src.length && /\s/.test(src[j])) j++;
      out.push(<span key={n++}>{src.slice(i, j)}</span>);
      i = j;
      continue;
    }
    push(c, "punct");
    i++;
  }
  return out;
}

// Generic line-by-line highlighter: comments only.
function highlightLine(src: string, commentRe: RegExp): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const lines = src.split("\n");
  lines.forEach((line, idx) => {
    if (commentRe.test(line)) {
      out.push(
        <span key={`c${idx}`} className={toneClass.comment}>
          {line}
        </span>,
      );
    } else {
      // simple highlight: strings in "..." -> string tone, parens -> punct
      const parts: React.ReactNode[] = [];
      let i = 0;
      let n = 0;
      while (i < line.length) {
        const ch = line[i];
        if (ch === '"') {
          let j = i + 1;
          while (j < line.length && line[j] !== '"') {
            if (line[j] === "\\") j++;
            j++;
          }
          parts.push(
            <span key={`s${idx}-${n++}`} className={toneClass.string}>
              {line.slice(i, j + 1)}
            </span>,
          );
          i = j + 1;
          continue;
        }
        if (/[()[\]{}]/.test(ch)) {
          parts.push(
            <span key={`p${idx}-${n++}`} className={toneClass.punct}>
              {ch}
            </span>,
          );
          i++;
          continue;
        }
        if (/[-+]?\d/.test(ch)) {
          const m = line.slice(i).match(/^-?\d+(\.\d+)?/);
          if (m) {
            parts.push(
              <span key={`n${idx}-${n++}`} className={toneClass.number}>
                {m[0]}
              </span>,
            );
            i += m[0].length;
            continue;
          }
        }
        parts.push(line[i]);
        i++;
      }
      out.push(<span key={`l${idx}`}>{parts}</span>);
    }
    if (idx < lines.length - 1) out.push("\n");
  });
  return out;
}

function highlightIni(src: string): React.ReactNode[] {
  const lines = src.split("\n");
  const out: React.ReactNode[] = [];
  lines.forEach((line, idx) => {
    if (/^\s*#/.test(line)) {
      out.push(
        <span key={`c${idx}`} className={toneClass.comment}>
          {line}
        </span>,
      );
    } else if (/^\s*\[.*\]\s*$/.test(line)) {
      out.push(
        <span key={`s${idx}`} className={toneClass.key}>
          {line}
        </span>,
      );
    } else if (/=/.test(line)) {
      const [k, ...rest] = line.split("=");
      out.push(
        <span key={`kv${idx}`}>
          <span className={toneClass.key}>{k}</span>
          <span className={toneClass.punct}>=</span>
          <span className={toneClass.string}>{rest.join("=")}</span>
        </span>,
      );
    } else {
      out.push(<span key={`o${idx}`}>{line}</span>);
    }
    if (idx < lines.length - 1) out.push("\n");
  });
  return out;
}

function highlightYaml(src: string): React.ReactNode[] {
  const lines = src.split("\n");
  const out: React.ReactNode[] = [];
  lines.forEach((line, idx) => {
    if (/^\s*#/.test(line)) {
      out.push(
        <span key={`c${idx}`} className={toneClass.comment}>
          {line}
        </span>,
      );
    } else {
      const m = line.match(/^(\s*-?\s*)([\w./-]+)(\s*:\s*)(.*)$/);
      if (m) {
        out.push(
          <span key={`l${idx}`}>
            <span>{m[1]}</span>
            <span className={toneClass.key}>{m[2]}</span>
            <span className={toneClass.punct}>{m[3]}</span>
            <span className={toneClass.string}>{m[4]}</span>
          </span>,
        );
      } else {
        out.push(<span key={`o${idx}`}>{line}</span>);
      }
    }
    if (idx < lines.length - 1) out.push("\n");
  });
  return out;
}

const GITHUB_RAW =
  "https://raw.githubusercontent.com/suenot/karabiner/master";

export function JsonViewer({ file }: { file: RuleFile }) {
  const [target, setTarget] = useState<TargetId>("karabiner");
  const [copied, setCopied] = useState<"idle" | "ok" | "err">("idle");

  const spec = useMemo(
    () => TARGETS.find((t) => t.id === target) ?? TARGETS[0],
    [target],
  );

  const source = useMemo(() => {
    try {
      return spec.convert(file);
    } catch (e) {
      return `# conversion error: ${e instanceof Error ? e.message : e}`;
    }
  }, [spec, file]);

  const baseName = file.fileName
    .replace(/^_+/, "")
    .replace(/\.json$/, "");
  const outFileName =
    target === "karabiner"
      ? file.fileName
      : `${baseName}.${spec.ext}`;

  const downloadUrl =
    target === "karabiner"
      ? `${GITHUB_RAW}/${file.fileName}`
      : `${GITHUB_RAW}/${target}/${baseName}.${spec.ext}`;

  const tokens = useMemo(
    () => highlight(source, spec.language as Language),
    [source, spec.language],
  );
  const lineCount = useMemo(() => source.split("\n").length, [source]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied("ok");
    } catch {
      setCopied("err");
    }
    setTimeout(() => setCopied("idle"), 1600);
  };

  return (
    <div className="rounded-xl ring-1 ring-zinc-800 bg-[#0d1117] overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-zinc-900/80 border-b border-zinc-800 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs font-mono text-zinc-300 truncate">
            {outFileName}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold ml-2">
            {spec.language.toUpperCase()} · {lineCount} lines · {spec.os}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={downloadUrl}
            download={outFileName}
            className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-300 ring-1 ring-zinc-700 hover:bg-zinc-700"
            title={`Download ${outFileName}`}
          >
            ⬇
          </a>
          <button
            onClick={onCopy}
            className={`text-xs font-medium px-3 py-1 rounded-md transition ring-1 ${
              copied === "ok"
                ? "bg-emerald-600 text-white ring-emerald-400"
                : copied === "err"
                  ? "bg-red-700 text-white ring-red-400"
                  : "bg-zinc-800 text-zinc-200 ring-zinc-700 hover:bg-zinc-700"
            }`}
            title="Copy to clipboard"
          >
            {copied === "ok"
              ? "✓ Copied"
              : copied === "err"
                ? "✗ Failed"
                : "⧉ Copy"}
          </button>
        </div>
      </div>

      {/* Target tabs */}
      <div className="flex overflow-x-auto bg-zinc-950/60 border-b border-zinc-800">
        {TARGETS.map((t) => {
          const active = t.id === target;
          return (
            <button
              key={t.id}
              onClick={() => setTarget(t.id)}
              className={`px-3 py-1.5 text-xs font-mono whitespace-nowrap border-b-2 transition ${
                active
                  ? "border-emerald-500 text-zinc-100 bg-zinc-900/60"
                  : "border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40"
              }`}
              title={`${t.label} (${t.os})`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Code body */}
      <div className="flex max-h-[480px] overflow-auto font-mono text-[12.5px] leading-[1.55]">
        <pre
          aria-hidden
          className="select-none text-right py-3 px-2 text-zinc-600 border-r border-zinc-800 bg-zinc-950/40"
        >
          {Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")}
        </pre>
        <pre className="py-3 px-3 text-zinc-100 whitespace-pre overflow-x-auto flex-1">
          <code>{tokens}</code>
        </pre>
      </div>
    </div>
  );
}
