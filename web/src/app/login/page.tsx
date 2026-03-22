import { routing } from '@/i18n/routing';
import { redirect } from 'next/navigation';

/** NextAuth `pages.signIn` points here; перенаправляем на локализованный вход. */
export default function LoginRedirect(): never {
  redirect(`/${routing.defaultLocale}/login`);
}
