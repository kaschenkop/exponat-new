'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { dashboardNavItems } from '@/shared/config/navigation';
import { cn } from '@/shared/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { useTranslations } from 'next-intl';

export function SidebarNav({
  onNavigate,
  collapsed,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}): React.ReactElement {
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {dashboardNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        const link = (
          <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              collapsed && 'justify-center px-2',
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 shrink-0',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
              aria-hidden
            />
            {!collapsed ? (
              <span className="truncate">{t(item.titleKey)}</span>
            ) : null}
          </Link>
        );

        if (collapsed) {
          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{t(item.titleKey)}</TooltipContent>
            </Tooltip>
          );
        }

        return <div key={item.href}>{link}</div>;
      })}
    </nav>
  );
}
