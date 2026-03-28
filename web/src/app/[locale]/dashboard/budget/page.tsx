import { redirect } from 'next/navigation';

export default function LegacyBudgetRedirectPage({
  params,
}: {
  params: { locale: string };
}): never {
  redirect(`/${params.locale}/dashboard/budgets`);
}
