import { routing } from '@/i18n/routing';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

/** NextAuth `pages.error` — редирект на локализованную страницу ошибки. */
export default function AuthErrorRedirect({ searchParams }: Props): never {
  const err = searchParams.error;
  const error = typeof err === 'string' ? err : '';
  const q = error ? `?error=${encodeURIComponent(error)}` : '';
  redirect(`/${routing.defaultLocale}/auth/error${q}`);
}
