import { z } from 'zod';
import { __ } from '@wordpress/i18n';

export const roleSchema = z.object({
  name: z.string().min(1, { message: __('Role name is required', 'yay-wholesale-b2b') }),
  description: z.string(),
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
});

const rolePaymentMethodsSchema = z.object({
  enabled: z.enum(['enable-all', 'enable-selected-methods']),
  selected_methods: z.array(z.string()), // method_id
});
const roleShippingMethodsSchema = z.object({
  enabled: z.enum(['enable-all', 'enable-selected-methods']),
  selected_methods: z.array(z.number()), // instance_id
});

export const roleFormSchema = z.object({
  role: roleSchema,
  paymentMethods: rolePaymentMethodsSchema.optional(),
  shippingMethods: roleShippingMethodsSchema.optional(),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

export type Role = z.infer<typeof roleSchema> & {
  /** @deprecated use slug instead */
  id: number;
  slug: string;
};

/** key is roleSlug, value is userCount */
export type UserCountByRole = Record<string, number>;
