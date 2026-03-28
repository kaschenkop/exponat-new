const RUB = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

export function formatMoney(amount: number, currency: string = 'RUB'): string {
  if (currency === 'RUB') {
    return RUB.format(amount);
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
