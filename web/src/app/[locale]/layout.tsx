import { AppProviders } from '@/app/providers';
import { routing } from '@/i18n/routing';
import { Toaster } from '@/shared/ui/toaster';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { JetBrains_Mono, Onest, Plus_Jakarta_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';

import '@/styles/globals.css';

const fontSans = Onest({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-onest',
  display: 'swap',
});

const fontDisplay = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono',
  display: 'swap',
});

export function generateStaticParams(): Array<{ locale: string }> {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Экспонат — управление выставками',
  description: 'SaaS-платформа для управления выставками с AI',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}): Promise<React.ReactElement> {
  const { locale } = params;

  if (!routing.locales.includes(locale as 'ru' | 'en')) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}
      lang={locale}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            {children}
            <Toaster />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
