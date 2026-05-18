"use client";

import { useMemo, useState } from "react";

// Minimal JSON tokenizer for VSCode-like syntax highlighting.
// Walks the source char-by-char, emitting <span> elements with tone classes.
type Tone =
  | "key"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "punct"
  | "ws";

const toneClass: Record<Tone, string> = {
  key: "text-sky-300",
  string: "text-amber-200",
  number: "text-emerald-300",
  boolean: "text-pink-300",
  null: "text-pink-300",
  punct: "text-zinc-500",
  ws: "text-zinc-500",
};

function highlight(src: string): React.ReactNode[] {
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
  // Track whether the next string we encounter is a key (followed by ':').
  while (i < src.length) {
    const c = src[i];
    if (c === '"') {
      // Read string.
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
      // Look ahead for ':' (key) skipping whitespace.
      let k = j + 1;
      while (k < src.length && /\s/.test(src[k])) k++;
      const isKey = src[k] === ":";
      push(tok, isKey ? "key" : "string");
      i = j + 1;
      continue;
    }
    if (c === "/" || /[-0-9]/.test(c)) {
      // Number
      const m = src.slice(i).match(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/);
      if (m) {
        push(m[0], "number");
        i += m[0].length;
        continue;
      }
    }
    if (/[a-z]/.test(c)) {
      // true | false | null
      const m = src.slice(i).match(/^(true|false|null)/);
      if (m) {
        push(m[0], m[0] === "null" ? "null" : "boolean");
        i += m[0].length;
        continue;
      }
    }
    if (/[\s]/.test(c)) {
      let j = i;
      while (j < src.length && /\s/.test(src[j])) j++;
      out.push(<span key={n++}>{src.slice(i, j)}</span>);
      i = j;
      continue;
    }
    // punctuation
    push(c, "punct");
    i++;
  }
  return out;
}

export function JsonViewer({
  source,
  fileName,
}: {
  source: string;
  fileName: string;
}) {
  const tokens = useMemo(() => highlight(source), [source]);
  const lineCount = useMemo(() => source.split("\n").length, [source]);
  const [copied, setCopied] = useState<"idle" | "ok" | "err">("idle");

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
      {/* IDE-like title bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-zinc-900/80 border-b border-zinc-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs font-mono text-zinc-300 truncate">
            {fileName}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold ml-2">
            JSON · {lineCount} lines
          </span>
        </div>
        <button
          onClick={onCopy}
          className={`text-xs font-medium px-3 py-1 rounded-md transition ring-1 ${
            copied === "ok"
              ? "bg-emerald-600 text-white ring-emerald-400"
              : copied === "err"
                ? "bg-red-700 text-white ring-red-400"
                : "bg-zinc-800 text-zinc-200 ring-zinc-700 hover:bg-zinc-700"
          }`}
          title="Copy raw JSON to clipboard"
        >
          {copied === "ok" ? "✓ Copied" : copied === "err" ? "✗ Failed" : "⧉ Copy"}
        </button>
      </div>
      {/* Code body with gutter */}
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
