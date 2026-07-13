import { z } from 'zod';
import { __ } from '@wordpress/i18n';

import { enableByRoleSchema } from './common.schema';
import { fieldSchema } from './settingsRegistration.schema';

export const registrationSettingsSchema = z.object({
  moderate: z.boolean(),
  wholesale_registration_page: z.string(),
  submit_button_label: z.string(),
  successful_registration_message: z.string(),
});

const paymentMethodSettingSchema = z.object({
  method_id: z.string(),
  enable_by_role: enableByRoleSchema,
});

const shippingMethodSettingSchema = z.object({
  instance_id: z.number(),
  zone_id: z.number(),
  enable_by_role: enableByRoleSchema,
});

export const settingsFormSchema = z.object({
  general: z.object({
    default_role: z.string(),
    disable_coupon: z.boolean(),
    disable_tax: z.boolean(),
    tax_display_mode: z.enum(['inherit', 'excl', 'incl']),
    guest_access_rule: z.enum(['no-restriction', 'hidden-prices', 'hidden-entire-shop']),
    wholesale_store_page: z.string(),
  }),
  display: z.object({
    wholesaler_price_format: z.enum(['retail-and-wholesale', 'wholesale-only']),
    retailer_price_format: z.enum(['retail-and-wholesale', 'retail-only']),
    wholesale_price_label: z.string(),
    wholesale_price_color: z.string(),
  }),
  registration: registrationSettingsSchema,
  registration_fields: z.object({
    fields: z.array(fieldSchema),
  }),
  payment_roles: z.array(paymentMethodSettingSchema).optional(),
  shipping_roles: z.array(shippingMethodSettingSchema).optional(),
});

export type Settings = z.infer<typeof settingsFormSchema>;
