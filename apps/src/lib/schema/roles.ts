import { __ } from '@wordpress/i18n';
import { z } from 'zod';

export const roleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, { message: __('Role name is required') }),
  description: z.string().optional(),
  discount: z
    .number()
    .min(0)
    .max(100, { message: __('Discount must be between 0 and 100') }),
  minOrderQuantity: z
    .number()
    .min(0, { message: __('Minimum order quantity must be greater than 0') }),
  minOrderAmount: z.number().min(0, { message: __('Minimum order amount must be greater than 0') }),
  applyToSalePrice: z.boolean(),
  status: z.boolean(),
  count: z.number().optional(),
});

export const createRoleSchema = roleSchema.omit({
  id: true,
});

export type RoleFormValues = z.infer<typeof roleSchema> | z.infer<typeof createRoleSchema>;

export type RolesListValues = z.infer<typeof roleSchema>;
