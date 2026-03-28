'use client';

import { useTranslations } from 'next-intl';

/** Заглушка: полноценный reorder через API — в следующей итерации. */
export function CategoryDragDrop(): React.ReactElement {
  const t = useTranslations('budget.categories');
  return (
    <p className="text-xs text-muted-foreground">{t('dragHint')}</p>
  );
}
