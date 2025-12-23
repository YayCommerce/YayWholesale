import { __ } from '@wordpress/i18n';
import { z } from 'zod';

export const roleSchema = z.object({
  id: z.number().min(1),
  name: z.string().min(1, { message: __('Role name is required') }),
  slug: z.string().min(1, { message: __('Role slug is required') }),
  description: z.string().optional(),
  discount: z
    .number({ required_error: __('Discount is required') })
    .min(0, { message: __('Discount must be between 0 and 100') })
    .max(100, { message: __('Discount must be between 0 and 100') }),

  minOrderQuantity: z
    .number({ required_error: __('Minimum order quantity is required') })
    .min(0, { message: __('Minimum order quantity must be greater than 0') }),
  minOrderAmount: z
    .number({ required_error: __('Minimum order amount is required') })
    .min(0, { message: __('Minimum order amount must be greater than 0') }),
  applyToSalePrice: z.boolean(),
  status: z.boolean(),
  count: z.number().optional(),
  isDefault: z.boolean().optional(),
});

export const createRoleSchema = roleSchema.omit({
  id: true,
  slug: true,
});

export type RoleFormValues = z.infer<typeof roleSchema> | z.infer<typeof createRoleSchema>;

export type RolesListValues = z.infer<typeof roleSchema>;
