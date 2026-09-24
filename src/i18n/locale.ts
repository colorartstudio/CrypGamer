import { Language } from '../types';

/** Preferência explícita do jogador (seletor de idioma). */
export const LOCALE_COOKIE = 'cg-locale';
/** Sugestão automática do país (geolocation). Não sobrescreve a preferência. */
export const GEO_LOCALE_COOKIE = 'cg-geo';

const LOCALES: Language[] = ['pt', 'en', 'es'];

const PORTUGUESE_COUNTRIES = new Set([
  'BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL',
]);

const SPANISH_COUNTRIES = new Set([
  'ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU',
  'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'GQ', 'PR',
]);

export function isLanguage(value: string | null | undefined): value is Language {
  return !!value && (LOCALES as string[]).includes(value);
}

/**
 * País ISO (ex.: "BR", "TR") → locale que o app realmente traduz.
 * Países sem tradução própria (incluindo TR) caem em inglês.
 */
export function countryToLocale(country: string | null | undefined): Language | null {
  if (!country) return null;
  const code = country.toUpperCase();
  if (PORTUGUESE_COUNTRIES.has(code)) return 'pt';
  if (SPANISH_COUNTRIES.has(code)) return 'es';
  return 'en';
}

export function localeFromAcceptLanguage(header: string | null): Language | null {
  if (!header) return null;
  const tags = header.split(',').map(part => part.trim().split(';')[0]?.toLowerCase() ?? '');
  for (const tag of tags) {
    const base = tag.split('-')[0];
    if (base === 'pt') return 'pt';
    if (base === 'es') return 'es';
    if (base === 'en') return 'en';
  }
  return null;
}

export function htmlLang(language: Language): string {
  if (language === 'pt') return 'pt-BR';
  if (language === 'es') return 'es';
  return 'en';
}
