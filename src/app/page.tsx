import { loadRuleFiles } from "@/lib/load-rules";
import { RuleViewer } from "@/components/RuleViewer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const files = await loadRuleFiles();
  const ruleCount = files.reduce((n, f) => n + f.rules.length, 0);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col gap-6">
        <header className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              karabiner-visualizer
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              SVG view of{" "}
              <a
                href="https://github.com/suenot/karabiner"
                className="underline decoration-zinc-600 hover:decoration-zinc-300"
              >
                suenot/karabiner
              </a>{" "}
              complex_modifications. {files.length} files · {ruleCount} rules.
            </p>
          </div>
          <a
            href="https://github.com/suenot/karabiner-visualizer"
            className="text-xs text-zinc-400 hover:text-zinc-100 underline decoration-zinc-700"
          >
            source ↗
          </a>
        </header>

        <RuleViewer files={files} />
      </div>
    </main>
  );
}
