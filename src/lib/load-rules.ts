import { promises as fs } from "node:fs";
import path from "node:path";
import { normalizeRuleFile, type RuleFile } from "./karabiner";

const RULES_DIR = path.resolve(process.cwd(), "..", "karabiner");

export async function loadRuleFiles(): Promise<RuleFile[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(RULES_DIR);
  } catch {
    return [];
  }

  const files = entries.filter((f) => f.endsWith(".json")).sort();
  const out: RuleFile[] = [];
  for (const name of files) {
    const full = path.join(RULES_DIR, name);
    try {
      const txt = await fs.readFile(full, "utf8");
      const raw = JSON.parse(txt);
      out.push(normalizeRuleFile(name, raw));
    } catch {
      out.push({ fileName: name, title: name, rules: [] });
    }
  }
  return out;
}
