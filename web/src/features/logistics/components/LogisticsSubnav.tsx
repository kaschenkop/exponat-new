'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';

const tabs = [
  { href: '', key: 'overview' as const },
  { href: '/exhibits', key: 'exhibits' as const },
  { href: '/shipments', key: 'shipments' as const },
  { href: '/tracking', key: 'tracking' as const },
  { href: '/monitoring', key: 'monitoring' as const },
  { href: '/inventory', key: 'inventory' as const },
  { href: '/reports', key: 'reports' as const },
];

export function LogisticsSubnav({ locale }: { locale: string }): React.ReactElement {
  const t = useTranslations('logisticsModule.tabs');
  const pathname = usePathname();
  const base = `/${locale}/dashboard/logistics`;

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-border pb-3"
      aria-label="Logistics"
    >
      {tabs.map(({ href, key }) => {
        const full = href ? `${base}${href}` : base;
        const active =
          href === ''
            ? pathname === base || pathname === `${base}/`
            : pathname.startsWith(full);
        return (
          <Link
            key={key}
            href={full}
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
