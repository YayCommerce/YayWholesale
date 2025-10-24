import { z } from 'zod';

export const rolesFormSchema = z.object({
  id: z.number().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  discount: z.number().min(0).max(100),
  minOrderQuantity: z.number().min(0),
  minOrderAmount: z.number().min(0),
  applyToSalePrice: z.boolean(),
  status: z.boolean(),
  count: z.number().min(0),
});

export const rolesListSchema = z.object({
  roles: z.array(rolesFormSchema),
});

export type RolesListFormData = z.infer<typeof rolesListSchema>;

export type RolesFormData = z.infer<typeof rolesFormSchema>;
