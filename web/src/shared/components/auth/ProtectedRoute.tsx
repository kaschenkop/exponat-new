'use client';

import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { useLocale, useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
};

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
}: ProtectedRouteProps): React.ReactElement | null {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirectToLogin(locale, router);
    }
    if (session?.error === 'RefreshAccessTokenError') {
      redirectToLogin(locale, router, 'RefreshAccessTokenError');
    }
  }, [status, session?.error, locale, router]);

  if (status === 'loading') {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (requiredRoles.length > 0) {
    const hasRole = requiredRoles.some((role) => session.user.roles.includes(role));
    if (!hasRole) {
      return <AccessDenied />;
    }
  }

  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some((p) =>
      session.user.permissions.includes(p),
    );
    if (!hasPermission) {
      return <AccessDenied />;
    }
  }

  return <>{children}</>;
}

function redirectToLogin(locale: string, router: ReturnType<typeof useRouter>, error?: string): void {
  const q = error ? `?error=${encodeURIComponent(error)}` : '';
  router.replace(`/${locale}/login${q}`);
}


function AccessDenied(): React.ReactElement {
  const locale = useLocale();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-bold">{t('accessDeniedTitle')}</h2>
      <p className="mt-2 text-muted-foreground">{t('accessDeniedBody')}</p>
      <Button asChild className="mt-6" variant="outline">
        <Link href={`/${locale}/dashboard`}>{tCommon('backToDashboard')}</Link>
      </Button>
    </div>
  );
}
