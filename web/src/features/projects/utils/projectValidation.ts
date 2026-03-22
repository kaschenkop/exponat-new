import { z } from 'zod';

export const locationSchema = z.object({
  venue: z.string().min(1),
  address: z.string(),
  city: z.string().min(1),
  country: z.string().min(1),
});

export const projectCreateSchema = z
  .object({
    name: z.string().min(2).max(500),
    description: z.string().max(10000).optional().default(''),
    type: z.enum(['museum', 'corporate', 'expo_forum', 'other']),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    totalBudget: z.number().min(0),
    location: locationSchema,
    managerId: z.string().uuid(),
    teamMemberIds: z.array(z.string().uuid()).default([]),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: 'endAfterStart',
    path: ['endDate'],
  });

export type ProjectCreateForm = z.infer<typeof projectCreateSchema>;
