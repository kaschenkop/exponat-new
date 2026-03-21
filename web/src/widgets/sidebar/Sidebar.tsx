'use client';

import { SidebarNav } from '@/widgets/sidebar/SidebarNav';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/ui/sheet';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { Menu, PanelsTopLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';

export function Sidebar(): React.ReactElement {
  const t = useTranslations('sidebar');
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <PanelsTopLeft className="h-8 w-8 text-primary" aria-hidden />
          <span className="font-display text-lg font-semibold">{t('brand')}</span>
        </div>
        <TooltipProvider>
          <div className="flex flex-1 flex-col gap-2 p-3">
            <SidebarNav />
          </div>
        </TooltipProvider>
      </aside>

      <div className="flex items-center border-b border-border bg-card px-4 py-3 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label={t('collapse')}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex h-16 items-center gap-2 border-b border-border px-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <PanelsTopLeft className="h-8 w-8 text-primary" aria-hidden />
                <span className="font-display text-lg font-semibold">
                  {t('brand')}
                </span>
              </Link>
            </div>
            <TooltipProvider>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <SidebarNav onNavigate={() => setOpen(false)} />
              </div>
            </TooltipProvider>
          </SheetContent>
        </Sheet>
        <div className="ml-3 flex items-center gap-2">
          <PanelsTopLeft className="h-7 w-7 text-primary" aria-hidden />
          <span className="font-display text-base font-semibold">{t('brand')}</span>
        </div>
      </div>
    </>
  );
}
