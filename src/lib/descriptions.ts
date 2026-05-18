// Hand-written context for each rule file. Keyed by JSON filename.
// Edit freely — these are author notes that show above the keyboard.

export const FILE_NOTES: Record<string, { headline: string; body: string }> = {
  "_right_command_to_shift.json": {
    headline: "Right ⌘ becomes Left ⇧",
    body:
      "Правый Command почти не используется по своему прямому назначению, " +
      "зато до него легко дотянуться правой рукой. Делаем его вторым shift — " +
      "теперь обе руки могут шифтовать симметрично без растяжки до right_shift.",
  },
  "caps_lock_to_left_shift.json": {
    headline: "Caps Lock becomes Left Shift",
    body:
      "Caps Lock — зло: случайно включённый, он ломает ввод. " +
      "Переделан в дополнительный left_shift, чтобы случайное нажатие " +
      "не превращало текст в КАПС, а ещё одна большая клавиша shift была " +
      "полезной.",
  },
  "catboard_arrows.json": {
    headline: "CatBoard arrows on Left ⌘",
    body:
      "Идея в духе CatBoard: при удержании левого Command клавиши под " +
      "правой рукой превращаются в навигационный кластер. " +
      "I/J/K/L = стрелки, U/O = home/end (⌘+←/→), P/; = page up / page down, " +
      "H = enter, Y = esc, M = backspace, , = forward delete. " +
      "Руки не уходят с домашнего ряда — навигация без правой части клавиатуры.",
  },
  "catboard_arrows_right.json": {
    headline: "CatBoard arrows on Right ⌘",
    body:
      "То же, что и catboard_arrows, но с правым Command. " +
      "Удобно, когда левый ⌘ занят другими шорткатами или хочется " +
      "управлять стрелками левой рукой.",
  },
  "iso_to_ansi.json": {
    headline: "Fix ISO keyboard quirks",
    body:
      "На европейских ISO-клавиатурах есть две неудобные раскладочные " +
      "особенности: лишняя узкая клавиша рядом с left_shift (там, где у " +
      "ANSI её нет) и Г-образный Enter с маленьким backslash сверху. " +
      "Этот набор подгоняет ISO к ощущению ANSI: клавиша возле shift " +
      "превращается в shift (длинный shift как на ANSI MacBook), " +
      "backslash возле Enter превращается в Enter (длинный Enter как на ANSI), " +
      "а §/± остаётся доступной как backtick через non_us_backslash.",
  },
  "numpad.json": {
    headline: "Numpad layer on Right ⌥",
    body:
      "MacBook без цифрового блока. Удерживая правый Option, правая " +
      "половина клавиатуры превращается в numpad: I/O/P = 7/8/9, " +
      "K/L/; = 4/5/6, M/,/. // = 0/1/2/3. Удобно для быстрого ввода " +
      "цифр без перехода на цифровой ряд.",
  },
};

export function notesFor(fileName: string) {
  return FILE_NOTES[fileName];
}
