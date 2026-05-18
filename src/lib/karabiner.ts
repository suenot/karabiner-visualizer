export type Modifier =
  | "left_command"
  | "right_command"
  | "left_option"
  | "right_option"
  | "left_control"
  | "right_control"
  | "left_shift"
  | "right_shift"
  | "fn"
  | "caps_lock"
  | "command"
  | "option"
  | "control"
  | "shift"
  | "any";

export type FromSpec = {
  key_code?: string;
  modifiers?: { mandatory?: Modifier[]; optional?: Modifier[] };
};

export type ToSpec = {
  key_code?: string;
  shell_command?: string;
  modifiers?: Modifier[] | { mandatory?: Modifier[]; optional?: Modifier[] };
};

export type Manipulator = {
  type?: string;
  from: FromSpec;
  to?: ToSpec[];
  to_if_alone?: ToSpec[];
  conditions?: unknown;
};

export type Rule = {
  description: string;
  manipulators: Manipulator[];
};

export type RuleFile = {
  fileName: string;
  title: string;
  rules: Rule[];
};

type RawRuleSet = { title?: string; rules?: Rule[] };
type RawSingle = { description?: string; manipulators?: Manipulator[] };

export function normalizeRuleFile(fileName: string, raw: unknown): RuleFile {
  const baseTitle = fileName.replace(/\.json$/, "");

  if (raw && typeof raw === "object") {
    const ruleSet = raw as RawRuleSet;
    if (Array.isArray(ruleSet.rules)) {
      return {
        fileName,
        title: ruleSet.title || baseTitle,
        rules: ruleSet.rules.filter((r) => r && r.manipulators),
      };
    }
    const single = raw as RawSingle;
    if (Array.isArray(single.manipulators)) {
      return {
        fileName,
        title: single.description || baseTitle,
        rules: [
          {
            description: single.description || baseTitle,
            manipulators: single.manipulators,
          },
        ],
      };
    }
  }
  return { fileName, title: baseTitle, rules: [] };
}

export function extractModifiers(spec: ToSpec | FromSpec): {
  mandatory: Modifier[];
  optional: Modifier[];
} {
  const mods = (spec as ToSpec).modifiers;
  if (!mods) return { mandatory: [], optional: [] };
  if (Array.isArray(mods)) return { mandatory: mods as Modifier[], optional: [] };
  return {
    mandatory: (mods.mandatory ?? []) as Modifier[],
    optional: (mods.optional ?? []) as Modifier[],
  };
}
