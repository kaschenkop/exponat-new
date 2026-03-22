'use client';

import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

type LoginViewProps = {
  locale: string;
};

export function LoginView({ locale }: LoginViewProps): React.ReactElement {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get('callbackUrl');
  const callbackUrl =
    rawCallback && rawCallback.startsWith('/') ? rawCallback : `/${locale}/dashboard`;
  const error = searchParams.get('error');

  const handleLogin = (): void => {
    void signIn('keycloak', { callbackUrl });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">{t('welcome')}</CardTitle>
          <CardDescription>{t('signInToContinue')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error === 'SessionExpired' && t('errors.sessionExpired')}
              {error === 'OAuthSignin' && t('errors.oauthError')}
              {error === 'OAuthCallback' && t('errors.callbackError')}
              {error === 'RefreshAccessTokenError' && t('errors.refreshTokenError')}
              {![
                'SessionExpired',
                'OAuthSignin',
                'OAuthCallback',
                'RefreshAccessTokenError',
              ].includes(error) && t('errors.generic', { code: error })}
            </div>
          ) : null}

          <Button className="w-full" size="lg" type="button" onClick={handleLogin}>
            {t('signIn')}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t('orContinueWith')}</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">{t('socialLoginAvailable')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
