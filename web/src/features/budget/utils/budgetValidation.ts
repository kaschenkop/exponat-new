import { z } from 'zod';

export const budgetCreateSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  projectId: z.string().optional(),
  period: z.enum(['monthly', 'quarterly', 'yearly', 'custom']).optional(),
  currency: z.enum(['RUB', 'USD', 'EUR']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  totalPlanned: z.number().nonnegative().optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).optional(),
});

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.string().nullable().optional(),
  code: z.string().max(50).optional(),
  plannedAmount: z.number().nonnegative().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const expenseCreateSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().min(1).max(500),
  amount: z.number().positive(),
  expenseDate: z.string().min(1),
  vendor: z.string().min(1).max(255),
  type: z.enum(['invoice', 'receipt', 'contract', 'other']).optional(),
  paymentMethod: z
    .enum(['cash', 'card', 'bank_transfer', 'other'])
    .optional(),
});
