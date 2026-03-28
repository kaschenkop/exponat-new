import type { Budget } from '../types/budget.types';

export function budgetProgressTone(
  budget: Pick<Budget, 'progressPercent' | 'warningThreshold' | 'criticalThreshold'>,
): 'default' | 'warning' | 'critical' {
  if (budget.progressPercent >= budget.criticalThreshold) return 'critical';
  if (budget.progressPercent >= budget.warningThreshold) return 'warning';
  return 'default';
}
