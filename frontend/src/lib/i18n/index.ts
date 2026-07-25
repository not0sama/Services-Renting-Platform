import en from "./strings.en";
import ar from "./strings.ar";
import type { Strings } from "./strings.en";

export type { Strings };
export type Language = "en" | "ar";

const strings: Record<Language, Strings> = { en, ar };

export function getStrings(lang: Language = "en"): Strings {
  return strings[lang] ?? strings.en;
}

export { en, ar };
