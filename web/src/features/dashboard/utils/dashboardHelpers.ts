import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export function formatCurrencyRub(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatChangePercent(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

export function groupActivityByDayLabel(
  iso: string,
  tToday: string,
  tYesterday: string,
): string {
  const d = parseISO(iso);
  if (isToday(d)) return tToday;
  if (isYesterday(d)) return tYesterday;
  return format(d, 'd MMMM yyyy', { locale: ru });
}
