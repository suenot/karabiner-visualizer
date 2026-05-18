import type { RuleFile } from "../karabiner";
import { toKanata } from "./kanata";
import { toAhk } from "./ahk";
import { toKeyd } from "./keyd";
import { toXremap } from "./xremap";
import { toKmonad } from "./kmonad";

export type TargetId = "karabiner" | "kanata" | "ahk" | "keyd" | "xremap" | "kmonad";

export type TargetSpec = {
  id: TargetId;
  label: string;
  os: string;
  ext: string;
  language: string;
  convert: (file: RuleFile) => string;
};

export const TARGETS: TargetSpec[] = [
  {
    id: "karabiner",
    label: "Karabiner",
    os: "macOS",
    ext: "json",
    language: "json",
    convert: (f) => f.raw,
  },
  {
    id: "kanata",
    label: "kanata",
    os: "Linux · Windows · macOS",
    ext: "kbd",
    language: "lisp",
    convert: toKanata,
  },
  {
    id: "ahk",
    label: "AutoHotkey v2",
    os: "Windows",
    ext: "ahk",
    language: "ahk",
    convert: toAhk,
  },
  {
    id: "keyd",
    label: "keyd",
    os: "Linux",
    ext: "conf",
    language: "ini",
    convert: toKeyd,
  },
  {
    id: "xremap",
    label: "xremap",
    os: "Linux",
    ext: "yml",
    language: "yaml",
    convert: toXremap,
  },
  {
    id: "kmonad",
    label: "KMonad",
    os: "Linux · Windows · macOS",
    ext: "kbd",
    language: "lisp",
    convert: toKmonad,
  },
];

export function targetById(id: string): TargetSpec | undefined {
  return TARGETS.find((t) => t.id === id);
}
