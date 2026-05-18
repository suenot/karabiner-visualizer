/**
 * Read every .json file in ../karabiner (sibling submodule) and write
 * a converted version into ../karabiner/<target>/<name>.<ext>.
 *
 * Usage:
 *   pnpm tsx scripts/generate-ports.ts
 *   # or:
 *   npx tsx scripts/generate-ports.ts
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { normalizeRuleFile } from "../src/lib/karabiner";
import { TARGETS } from "../src/lib/converters";

const SRC = path.resolve(process.cwd(), "..", "karabiner");

async function main() {
  const entries = await fs.readdir(SRC);
  const jsonFiles = entries.filter((f) => f.endsWith(".json")).sort();
  if (jsonFiles.length === 0) {
    console.error(`No JSON files found in ${SRC}`);
    process.exit(1);
  }

  const targets = TARGETS.filter((t) => t.id !== "karabiner");
  for (const t of targets) {
    const dir = path.join(SRC, t.id);
    await fs.mkdir(dir, { recursive: true });
  }

  for (const name of jsonFiles) {
    const txt = await fs.readFile(path.join(SRC, name), "utf8");
    const parsed = JSON.parse(txt);
    const file = normalizeRuleFile(name, parsed, txt);
    if (file.rules.length === 0) {
      console.warn(`  skip ${name} (no rules)`);
      continue;
    }
    console.log(`→ ${name}`);
    for (const t of targets) {
      const out = t.convert(file);
      const base = name.replace(/^_+/, "").replace(/\.json$/, "");
      const outPath = path.join(SRC, t.id, `${base}.${t.ext}`);
      await fs.writeFile(outPath, out, "utf8");
      console.log(`    ${t.id.padEnd(7)} → ${path.relative(SRC, outPath)}`);
    }
  }

  // Per-target README pointing to upstream tools.
  for (const t of targets) {
    const readme = [
      `# ${t.label} ports`,
      "",
      `Auto-generated from the \`*.json\` rule files in the parent directory.`,
      `Target OS: **${t.os}**.`,
      "",
      "Do not edit by hand — re-run",
      "",
      "```bash",
      "cd karabiner-visualizer",
      "npx tsx scripts/generate-ports.ts",
      "```",
      "",
      "in the visualizer repo to regenerate.",
      "",
    ].join("\n");
    await fs.writeFile(path.join(SRC, t.id, "README.md"), readme, "utf8");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
