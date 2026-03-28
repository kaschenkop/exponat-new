'use client';

import * as React from 'react';

import { cn } from '@/shared/lib/utils';

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (v: string) => void;
} | null>(null);

function Tabs({
  value,
  onValueChange,
  children,
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function TabsTrigger({
  className,
  value,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }): React.ReactElement {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be inside Tabs');
  const selected = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        selected
          ? 'bg-background text-foreground shadow-sm'
          : 'hover:bg-background/60 hover:text-foreground',
        className,
      )}
      onClick={() => ctx.onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({
  className,
  value,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }): React.ReactElement {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be inside Tabs');
  if (ctx.value !== value) return <></>;
  return (
    <div role="tabpanel" className={cn('mt-2', className)} {...props}>
      {children}
    </div>
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
