import type { Lang } from "./domain/types";
import { en } from "./i18n/en";
import { es } from "./i18n/es";
import { fr } from "./i18n/fr";
import { km } from "./i18n/km";
import { ko } from "./i18n/ko";
import { mn } from "./i18n/mn";
import type { Messages } from "./i18n/messages";

const catalogs: Record<Lang, Messages> = { ko, en, es, fr, km, mn };

export type { Messages };

export function copy(lang: Lang): Messages {
  return catalogs[lang] ?? catalogs.ko;
}

export function submitMessage(lang: Lang, submitted?: string, error?: string): string | null {
  const text = copy(lang);
  if (submitted === "demo") return text.submittedDemo;
  if (submitted === "live") return text.submittedLive;
  if (!error) return null;
  return text.errors[error as keyof typeof text.errors] ?? text.errors.save_failed;
}
