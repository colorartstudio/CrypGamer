import { Language } from '../types';
import { GEO_LOCALE_COOKIE, LOCALE_COOKIE, htmlLang, isLanguage, localeFromAcceptLanguage } from './locale';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function writeLocaleCookie(name: string, value: Language) {
  document.cookie = `${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function hasUserLocale(): boolean {
  return isLanguage(readCookie(LOCALE_COOKIE));
}

/**
 * País via /api/geo (header x-vercel-ip-country).
 * Não roda se o jogador já escolheu o idioma.
 */
export async function detectLocaleFromGeo(): Promise<Language | null> {
  if (hasUserLocale()) return null;
  try {
    const response = await fetch('/api/geo', { cache: 'no-store' });
    if (!response.ok) return null;
    const data = (await response.json()) as { locale?: string };
    if (!isLanguage(data.locale) || hasUserLocale()) return null;
    writeLocaleCookie(GEO_LOCALE_COOKIE, data.locale);
    return data.locale;
  } catch {
    return null;
  }
}

/** 1) escolha do usuário  2) país já detectado  3) idioma do navegador  4) pt */
export function resolveClientLocale(): Language {
  const chosen = readCookie(LOCALE_COOKIE);
  if (isLanguage(chosen)) return chosen;

  const geo = readCookie(GEO_LOCALE_COOKIE);
  if (isLanguage(geo)) return geo;

  const fromBrowser = localeFromAcceptLanguage(
    typeof navigator !== 'undefined' ? navigator.language : null,
  );
  return fromBrowser ?? 'pt';
}

export function applyDocumentLang(language: Language) {
  document.documentElement.lang = htmlLang(language);
}
