import { z } from 'zod';

const locationSchema = z.object({
  venue: z.string().min(1, 'Укажите площадку'),
  address: z.string(),
  city: z.string().min(1, 'Укажите город'),
  country: z.string().min(1, 'Укажите страну'),
});

export const projectCreateSchema = z
  .object({
    name: z.string().min(2, 'Название от 2 символов'),
    description: z.string(),
    type: z.enum(['museum', 'corporate', 'expo_forum', 'other']),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    totalBudget: z.coerce.number().min(0),
    location: locationSchema,
    managerId: z.string().uuid('Выберите руководителя'),
    teamMemberIds: z.array(z.string().uuid()).default([]),
  })
  .refine(
    (data) => {
      const a = new Date(data.startDate);
      const b = new Date(data.endDate);
      return b >= a;
    },
    { message: 'Дата окончания не раньше начала', path: ['endDate'] },
  );

export type ProjectCreateFormValues = z.infer<typeof projectCreateSchema>;

export const projectWizardStep1Schema = z.object({
  name: z.string().min(2, 'Название от 2 символов'),
  description: z.string(),
  type: z.enum(['museum', 'corporate', 'expo_forum', 'other']),
});

export const projectWizardStep2Schema = z
  .object({
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    totalBudget: z.coerce.number().min(0),
  })
  .refine(
    (data) => {
      const a = new Date(data.startDate);
      const b = new Date(data.endDate);
      return b >= a;
    },
    { message: 'Дата окончания не раньше начала', path: ['endDate'] },
  );

export const projectWizardStep3Schema = z.object({
  location: locationSchema,
  managerId: z.string().uuid('Выберите руководителя'),
  teamMemberIds: z.array(z.string().uuid()).default([]),
});
