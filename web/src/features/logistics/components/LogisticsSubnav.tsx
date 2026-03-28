'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';

/** Пути без префикса локали — см. createNavigation в @/i18n/navigation */
const tabs = [
  { path: '/dashboard/logistics', key: 'overview' as const, exact: true },
  { path: '/dashboard/logistics/exhibits', key: 'exhibits' as const },
  { path: '/dashboard/logistics/shipments', key: 'shipments' as const },
  { path: '/dashboard/logistics/tracking', key: 'tracking' as const },
  { path: '/dashboard/logistics/monitoring', key: 'monitoring' as const },
  { path: '/dashboard/logistics/inventory', key: 'inventory' as const },
  { path: '/dashboard/logistics/reports', key: 'reports' as const },
];

function isTabActive(
  pathname: string,
  path: string,
  exact?: boolean,
): boolean {
  if (exact) {
    return pathname === path || pathname === `${path}/`;
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function LogisticsSubnav(): React.ReactElement {
  const t = useTranslations('logisticsModule.tabs');
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-border pb-3"
      aria-label="Logistics"
    >
      {tabs.map(({ path, key, exact }) => {
        const active = isTabActive(pathname, path, exact);
        return (
          <Link
            key={key}
            href={path}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
