import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { loadRuleFiles, loadVisualizerConfig } from "@/lib/load-rules";
import { RuleViewer } from "@/components/RuleViewer";
import { SiteHeader } from "@/components/SiteHeader";

export const revalidate = 600;

type Params = Promise<{ user: string }>;
type SearchParams = Promise<{ repo?: string; branch?: string }>;

function resolveCoords(user: string, sp: { repo?: string; branch?: string }) {
  const repoName = sp.repo ?? "karabiner";
  const branch = sp.branch ?? "master";
  const repo = `${user}/${repoName}`;
  return { repo, branch };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { user } = await params;
  const sp = await searchParams;
  const { repo } = resolveCoords(user, sp);
  return {
    title: `${repo} — karabiner-visualizer`,
    description: `Visualize Karabiner-Elements rules from github.com/${repo}`,
  };
}

export default async function UserPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { user } = await params;
  const sp = await searchParams;
  const { repo, branch } = resolveCoords(user, sp);
  const [files, config] = await Promise.all([
    loadRuleFiles({ repo, branch }),
    loadVisualizerConfig({ repo, branch }),
  ]);
  const ruleCount = files.reduce((n, f) => n + f.rules.length, 0);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col gap-6">
        <SiteHeader current="user" />

        <header className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <Link
                href={`/u/${user}`}
                className="text-zinc-100 hover:text-emerald-400 transition"
              >
                @{user}
              </Link>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Rules from{" "}
              <a
                href={`https://github.com/${repo}`}
                className="underline decoration-zinc-600 hover:decoration-zinc-300"
                target="_blank"
                rel="noreferrer"
              >
                {repo}
              </a>{" "}
              <span className="text-zinc-600">@ {branch}</span>
              {" · "}
              {files.length} files · {ruleCount} rules.
            </p>
          </div>
        </header>

        <Suspense fallback={<div className="text-zinc-500 text-sm">Loading…</div>}>
          <RuleViewer
            files={files}
            repo={repo}
            branch={branch}
            defaultRule={config?.defaultRule ?? null}
          />
        </Suspense>
      </div>
    </main>
  );
}
