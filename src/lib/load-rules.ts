import { promises as fs } from "node:fs";
import path from "node:path";
import { normalizeRuleFile, type RuleFile } from "./karabiner";

const DEFAULT_REPO = process.env.KARABINER_REPO ?? "suenot/karabiner";
const DEFAULT_BRANCH = process.env.KARABINER_BRANCH ?? "master";
const LOCAL_DIR = path.resolve(process.cwd(), "..", "karabiner");

// Cache GitHub responses for 1h on the server. fetch() in Next.js will
// honor the revalidate option for both edge and node runtimes.
const REVALIDATE_SECONDS = 3600;

export type RepoCoords = { repo: string; branch: string };

type GhFile = { name: string; type: string; download_url: string | null };

async function loadFromGitHub(coords: RepoCoords): Promise<RuleFile[]> {
  const { repo, branch } = coords;
  const apiUrl = `https://api.github.com/repos/${repo}/contents?ref=${branch}`;
  const rawBase = `https://raw.githubusercontent.com/${repo}/${branch}`;

  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "user-agent": "karabiner-visualizer",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const listRes = await fetch(apiUrl, {
    headers,
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!listRes.ok) {
    console.error(
      `[load-rules] GitHub list failed for ${repo}@${branch}: ${listRes.status} ${listRes.statusText}`,
    );
    return [];
  }
  const list = (await listRes.json()) as GhFile[];
  const jsonFiles = list
    .filter(
      (f) =>
        f.type === "file" &&
        f.name.endsWith(".json") &&
        !f.name.startsWith("."),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const out: RuleFile[] = await Promise.all(
    jsonFiles.map(async (f) => {
      const url = f.download_url ?? `${rawBase}/${encodeURIComponent(f.name)}`;
      try {
        const res = await fetch(url, {
          headers: { "user-agent": "karabiner-visualizer" },
          next: { revalidate: REVALIDATE_SECONDS },
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const txt = await res.text();
        return normalizeRuleFile(f.name, JSON.parse(txt), txt);
      } catch (err) {
        console.error(`[load-rules] fetch ${f.name} failed:`, err);
        return { fileName: f.name, title: f.name, rules: [], raw: "" };
      }
    }),
  );
  return out;
}

async function loadFromLocal(): Promise<RuleFile[] | null> {
  try {
    const entries = await fs.readdir(LOCAL_DIR);
    const files = entries
      .filter((f) => f.endsWith(".json") && !f.startsWith("."))
      .sort();
    if (files.length === 0) return null;
    const out: RuleFile[] = [];
    for (const name of files) {
      const full = path.join(LOCAL_DIR, name);
      try {
        const txt = await fs.readFile(full, "utf8");
        out.push(normalizeRuleFile(name, JSON.parse(txt), txt));
      } catch {
        out.push({ fileName: name, title: name, rules: [], raw: "" });
      }
    }
    return out;
  } catch {
    return null;
  }
}

export async function loadRuleFiles(
  coords?: Partial<RepoCoords>,
): Promise<RuleFile[]> {
  const repo = coords?.repo ?? DEFAULT_REPO;
  const branch = coords?.branch ?? DEFAULT_BRANCH;

  // In dev, prefer the sibling submodule only for the default repo so edits
  // to local JSON files show up immediately while non-default repos still
  // resolve over the network.
  if (
    process.env.NODE_ENV === "development" &&
    repo === DEFAULT_REPO
  ) {
    const local = await loadFromLocal();
    if (local && local.length > 0) return local;
  }
  return loadFromGitHub({ repo, branch });
}

export const defaultRepoCoords: RepoCoords = {
  repo: DEFAULT_REPO,
  branch: DEFAULT_BRANCH,
};

export type VisualizerConfig = {
  /** File name (with or without .json) of the rule that should open by default. */
  defaultRule?: string;
};

async function loadConfigFromGitHub(
  coords: RepoCoords,
): Promise<VisualizerConfig | null> {
  const { repo, branch } = coords;
  const url = `https://raw.githubusercontent.com/${repo}/${branch}/.visualizer.json`;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "karabiner-visualizer" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as VisualizerConfig;
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

async function loadConfigFromLocal(): Promise<VisualizerConfig | null> {
  try {
    const full = path.join(LOCAL_DIR, ".visualizer.json");
    const txt = await fs.readFile(full, "utf8");
    const data = JSON.parse(txt) as VisualizerConfig;
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

export async function loadVisualizerConfig(
  coords?: Partial<RepoCoords>,
): Promise<VisualizerConfig | null> {
  const repo = coords?.repo ?? DEFAULT_REPO;
  const branch = coords?.branch ?? DEFAULT_BRANCH;
  if (
    process.env.NODE_ENV === "development" &&
    repo === DEFAULT_REPO
  ) {
    const local = await loadConfigFromLocal();
    if (local) return local;
  }
  return loadConfigFromGitHub({ repo, branch });
}
