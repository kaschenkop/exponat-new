import { BudgetDetailLayout } from '@/features/budget/components/BudgetDetailLayout';

export default function BudgetIdLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <BudgetDetailLayout>{children}</BudgetDetailLayout>;
}
