// Hand-written context for each rule file. Keyed by JSON filename.
// Edit freely — these are author notes shown above the keyboard.

export type FileStatus = "active" | "experimental";

export type FileNote = {
  headline: string;
  body: string;
  status: FileStatus;
};

export const FILE_NOTES: Record<string, FileNote> = {
  "caps_lock_to_left_shift.json": {
    status: "active",
    headline: "Caps Lock becomes Left Shift",
    body:
      "Caps Lock is evil — toggled by accident it breaks input. " +
      "Remapped to act as an extra left_shift, so a stray press never " +
      "turns text into SHOUTING, and there's a bigger shift target.",
  },
  "catboard_arrows.json": {
    status: "active",
    headline: "CatBoard arrows on Left ⌘",
    body:
      "CatBoard-style nav layer: while holding left Command, the right " +
      "hand turns into a navigation cluster. " +
      "I/J/K/L = arrows, U/O = home/end (⌘+←/→), P/; = page up / page down, " +
      "H = enter, Y = esc, M = backspace, , = forward delete. " +
      "Hands stay on the home row — no reaching for the right edge.",
  },

  "_right_command_to_shift.json": {
    status: "experimental",
    headline: "Right ⌘ becomes Left ⇧",
    body:
      "Right Command is rarely used for its own purpose but easy to reach " +
      "with the right thumb. Turn it into a second shift so both hands can " +
      "shift symmetrically without stretching to right_shift.",
  },
  "catboard_arrows_right.json": {
    status: "experimental",
    headline: "CatBoard arrows on Right ⌘",
    body:
      "Same idea as catboard_arrows, but bound to right Command. " +
      "Handy when left ⌘ is taken by other shortcuts or when you'd " +
      "rather drive arrows with the left hand.",
  },
  "iso_to_ansi.json": {
    status: "experimental",
    headline: "Fix ISO keyboard quirks",
    body:
      "European ISO keyboards have two awkward differences: an extra " +
      "narrow key next to left_shift (which ANSI doesn't have) and an " +
      "L-shaped Enter with a tiny backslash on top. This set makes ISO " +
      "feel like ANSI: the key next to shift becomes shift (long ANSI-style " +
      "shift), the backslash next to Enter becomes Enter (long ANSI-style " +
      "Enter), and the §/± key stays useful as backtick via non_us_backslash.",
  },
  "numpad.json": {
    status: "experimental",
    headline: "Numpad layer on Right ⌥",
    body:
      "MacBooks lack a numpad. Hold right Option and the right half of " +
      "the keyboard turns into one: I/O/P = 7/8/9, K/L/; = 4/5/6, " +
      "M/,/./ /= 0/1/2/3. Fast number entry without going to the digit row.",
  },
};

export function notesFor(fileName: string): FileNote | undefined {
  return FILE_NOTES[fileName];
}

export function statusOf(fileName: string): FileStatus {
  return FILE_NOTES[fileName]?.status ?? "experimental";
}
