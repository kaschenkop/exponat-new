import { setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';

export function initPageLocale(locale: string): void {
  if (!routing.locales.includes(locale as 'ru' | 'en')) {
    return;
  }

  setRequestLocale(locale);
}
