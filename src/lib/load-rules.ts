import { promises as fs } from "node:fs";
import path from "node:path";
import { normalizeRuleFile, type RuleFile } from "./karabiner";

const REPO = process.env.KARABINER_REPO ?? "suenot/karabiner";
const BRANCH = process.env.KARABINER_BRANCH ?? "master";
const API_URL = `https://api.github.com/repos/${REPO}/contents?ref=${BRANCH}`;
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;
const LOCAL_DIR = path.resolve(process.cwd(), "..", "karabiner");

// Cache GitHub responses for 1h on the server. fetch() in Next.js will
// honor the revalidate option for both edge and node runtimes.
const REVALIDATE_SECONDS = 3600;

type GhFile = { name: string; type: string; download_url: string | null };

async function loadFromGitHub(): Promise<RuleFile[]> {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "user-agent": "karabiner-visualizer",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const listRes = await fetch(API_URL, {
    headers,
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!listRes.ok) {
    console.error(
      `[load-rules] GitHub list failed: ${listRes.status} ${listRes.statusText}`,
    );
    return [];
  }
  const list = (await listRes.json()) as GhFile[];
  const jsonFiles = list
    .filter((f) => f.type === "file" && f.name.endsWith(".json"))
    .sort((a, b) => a.name.localeCompare(b.name));

  const out: RuleFile[] = await Promise.all(
    jsonFiles.map(async (f) => {
      const url = f.download_url ?? `${RAW_BASE}/${encodeURIComponent(f.name)}`;
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
    const files = entries.filter((f) => f.endsWith(".json")).sort();
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

export async function loadRuleFiles(): Promise<RuleFile[]> {
  // In development, prefer the sibling submodule if it exists so edits
  // to JSON files show up immediately. In production (no submodule),
  // pull from GitHub.
  if (process.env.NODE_ENV === "development") {
    const local = await loadFromLocal();
    if (local && local.length > 0) return local;
  }
  return loadFromGitHub();
}
