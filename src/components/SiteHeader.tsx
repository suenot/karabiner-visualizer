import Link from "next/link";

type Current = "constructor" | "user";

export function SiteHeader({ current }: { current?: Current }) {
  return (
    <nav className="flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-1">
        <Link
          href="/"
          className={`px-3 py-1.5 rounded-md font-medium transition ${
            current === "constructor"
              ? "bg-emerald-600 text-zinc-950"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          }`}
        >
          Constructor
        </Link>
        <Link
          href="/u/suenot"
          className={`px-3 py-1.5 rounded-md font-medium transition ${
            current === "user"
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          }`}
        >
          @suenot
        </Link>
      </div>
      <a
        href="https://github.com/suenot/karabiner-visualizer"
        target="_blank"
        rel="noreferrer"
        className="text-xs text-zinc-500 hover:text-zinc-200 underline decoration-zinc-700"
      >
        source ↗
      </a>
    </nav>
  );
}
