import { LoginView } from '@/features/auth/ui/LoginView';
import { initPageLocale } from '@/i18n/server';
import { Skeleton } from '@/shared/ui/skeleton';
import { Suspense } from 'react';

/** Не кэшировать страницу со снимком старых messages (иначе подписи из JSON не обновляются). */
export const dynamic = 'force-dynamic';

export default async function LoginPage({
  params,
}: {
  params: { locale: string };
}): Promise<React.ReactElement> {
  initPageLocale(params.locale);
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Skeleton className="h-64 w-full max-w-md" />
        </div>
      }
    >
      <LoginView locale={params.locale} />
    </Suspense>
  );
}
