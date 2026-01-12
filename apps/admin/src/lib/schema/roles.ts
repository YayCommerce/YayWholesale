import { __ } from '@wordpress/i18n';
import { z } from 'zod';

export const roleSchema = z.object({
  id: z.number().min(1),
  name: z.string().min(1, { message: __('Role name is required', 'yay-wholesale-b2b') }),
  slug: z.string().min(1, { message: __('Role slug is required', 'yay-wholesale-b2b') }),
  description: z.string().optional(),
  discount: z
    .number({ required_error: __('Discount is required', 'yay-wholesale-b2b') })
    .min(0, { message: __('Discount must be between 0 and 100', 'yay-wholesale-b2b') })
    .max(100, { message: __('Discount must be between 0 and 100', 'yay-wholesale-b2b') }),

  minOrderQuantity: z
    .number({ required_error: __('Minimum order quantity is required', 'yay-wholesale-b2b') })
    .min(0, { message: __('Minimum order quantity must be greater than 0', 'yay-wholesale-b2b') }),
  minOrderAmount: z
    .number({ required_error: __('Minimum order amount is required', 'yay-wholesale-b2b') })
    .min(0, { message: __('Minimum order amount must be greater than 0', 'yay-wholesale-b2b') }),
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
