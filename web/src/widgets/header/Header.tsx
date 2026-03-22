'use client';

import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Bell, LogOut, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { signOut, useSession } from 'next-auth/react';

export function Header(): React.ReactElement {
  const t = useTranslations('header');
  const tAuth = useTranslations('auth');
  const { data: session } = useSession();
  const locale = useLocale();

  return (
    <header className="flex h-16 items-center justify-end gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-8">
      <Button variant="ghost" size="icon" aria-label={t('notifications')}>
        <Bell className="h-5 w-5" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label={t('profile')}>
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate font-normal">
            {session?.user?.email ?? t('profile')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              void signOut({ callbackUrl: `/${locale}` });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {tAuth('signOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
