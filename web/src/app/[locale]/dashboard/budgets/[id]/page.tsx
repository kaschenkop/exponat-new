import { redirect } from 'next/navigation';

export default function BudgetIdRedirectPage({
  params,
}: {
  params: { locale: string; id: string };
}): never {
  redirect(`/${params.locale}/dashboard/budgets/${params.id}/overview`);
}
