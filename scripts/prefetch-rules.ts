/**
 * Pre-build script: fetches the default repo's rule files and visualizer
 * config so `next build` embeds them in the deployment without runtime
 * GitHub requests.
 *
 * Resolution order:
 *   1. Local sibling submodule (../karabiner) — fast, works offline
 *   2. GitHub API + raw.githubusercontent.com — used in CI when submodule
 *      is not checked out
 *
 * Output files (relative to project root):
 *   data/rules-default.json   — RuleFile[]
 *   data/config-default.json  — VisualizerConfig | null
 *
 * Usage (invoked automatically via "prebuild"):
 *   npx tsx scripts/prefetch-rules.ts
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { normalizeRuleFile, type RuleFile } from "../src/lib/karabiner.js";
import type { VisualizerConfig } from "../src/lib/load-rules.js";

const REPO = process.env.KARABINER_REPO ?? "suenot/karabiner";
const BRANCH = process.env.KARABINER_BRANCH ?? "master";
const LOCAL_DIR = path.resolve(process.cwd(), "..", "karabiner");
const OUT_DIR = path.resolve(process.cwd(), "data");

// ── local ────────────────────────────────────────────────────────────────────

async function loadRulesLocal(): Promise<RuleFile[] | null> {
  try {
    const entries = await fs.readdir(LOCAL_DIR);
    const files = entries
      .filter((f) => f.endsWith(".json") && !f.startsWith("."))
      .sort();
    if (files.length === 0) return null;
    const out: RuleFile[] = [];
    for (const name of files) {
      try {
        const txt = await fs.readFile(path.join(LOCAL_DIR, name), "utf8");
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

async function loadConfigLocal(): Promise<VisualizerConfig | null> {
  try {
    const txt = await fs.readFile(
      path.join(LOCAL_DIR, ".visualizer.json"),
      "utf8",
    );
    const data = JSON.parse(txt) as VisualizerConfig;
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

// ── github ───────────────────────────────────────────────────────────────────

type GhFile = { name: string; type: string; download_url: string | null };

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    accept: "application/vnd.github+json",
    "user-agent": "karabiner-visualizer-prefetch",
  };
  if (process.env.GITHUB_TOKEN) h.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function loadRulesGitHub(): Promise<RuleFile[]> {
  const apiUrl = `https://api.github.com/repos/${REPO}/contents?ref=${BRANCH}`;
  const rawBase = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;

  const listRes = await fetch(apiUrl, { headers: ghHeaders() });
  if (!listRes.ok) {
    throw new Error(
      `GitHub list failed: ${listRes.status} ${listRes.statusText}`,
    );
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

  return Promise.all(
    jsonFiles.map(async (f) => {
      const url =
        f.download_url ?? `${rawBase}/${encodeURIComponent(f.name)}`;
      try {
        const res = await fetch(url, { headers: { "user-agent": "karabiner-visualizer-prefetch" } });
        if (!res.ok) throw new Error(`${res.status}`);
        const txt = await res.text();
        return normalizeRuleFile(f.name, JSON.parse(txt), txt);
      } catch (err) {
        console.error(`[prefetch] fetch ${f.name} failed:`, err);
        return { fileName: f.name, title: f.name, rules: [], raw: "" };
      }
    }),
  );
}

async function loadConfigGitHub(): Promise<VisualizerConfig | null> {
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/.visualizer.json`;
  try {
    const res = await fetch(url, { headers: { "user-agent": "karabiner-visualizer-prefetch" } });
    if (!res.ok) return null;
    const data = (await res.json()) as VisualizerConfig;
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  // Rules
  let rules = await loadRulesLocal();
  if (rules && rules.length > 0) {
    console.log(
      `[prefetch] Loaded ${rules.length} rule files from local submodule`,
    );
  } else {
    console.log(
      `[prefetch] Local submodule not found or empty, fetching from GitHub (${REPO}@${BRANCH})…`,
    );
    rules = await loadRulesGitHub();
    console.log(`[prefetch] Fetched ${rules.length} rule files from GitHub`);
  }
  await fs.writeFile(
    path.join(OUT_DIR, "rules-default.json"),
    JSON.stringify(rules),
    "utf8",
  );

  // Config
  let config = await loadConfigLocal();
  if (config === null) {
    config = await loadConfigGitHub();
  }
  await fs.writeFile(
    path.join(OUT_DIR, "config-default.json"),
    JSON.stringify(config),
    "utf8",
  );

  const ruleCount = rules.reduce((n, f) => n + f.rules.length, 0);
  console.log(
    `[prefetch] Done — ${rules.length} files, ${ruleCount} rules, config: ${JSON.stringify(config)}`,
  );
}

main().catch((err) => {
  console.error("[prefetch] Fatal:", err);
  process.exit(1);
});
