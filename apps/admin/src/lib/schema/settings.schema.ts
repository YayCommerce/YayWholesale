import { z } from 'zod';
import { __ } from '@wordpress/i18n';

import { enableByRoleSchema } from './common.schema';

export const registrationSettingsSchema = z.object({
  moderate: z.boolean(),
  wholesale_registration_page: z.string(),
  submit_button_label: z.string(),
  successful_registration_message: z.string(),
});

const choiceFieldTypes = ['radio', 'select', 'checkbox'] as const;

const fieldSchema = z
  .object({
    id: z.string(),
    label: z
      .string()
      .min(1, __('Fill in the field label', 'yay-wholesale-b2b'))
      .regex(
        /^[\p{L}0-9 _\-&:/]+$/u,
        __(
          'Label can only contain letters, numbers, spaces, and common symbols (-, _, &, :, /.).',
          'yay-wholesale-b2b',
        ),
      ),
    inputName: z.string(),
    type: z.enum(['text', 'email', 'number', 'phone', 'date', 'textarea', 'select', ...choiceFieldTypes]),
    placeholder: z.string(),
    choices: z.array(z.string()).optional(),
    columnWidth: z.enum(['50%', '100%']),
    deletable: z.boolean(),
    isDefault: z.boolean(),
    isRequired: z.boolean(),
    isHidden: z.boolean(),
  })
  .superRefine((field, ctx) => {
    if (choiceFieldTypes.includes(field.type as (typeof choiceFieldTypes)[number])) {
      if (!field.choices?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: __('Add choices for the field', 'yay-wholesale-b2b'),
          path: ['choices'],
        });
      }
    }
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
    fields: z.array(fieldSchema).superRefine((fields, ctx) => {
      const existedLabels = new Set<string>();

      fields.forEach((field, index) => {
        if (existedLabels.has(field.label.toLowerCase())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: __('Label must be unique', 'yay-wholesale-b2b'),
            path: [index, 'label'], // direct to the duplicate label and show error
          });
        } else {
          existedLabels.add(field.label.toLowerCase());
        }
      });
    }),
  }),
  payment_roles: z.array(paymentMethodSettingSchema).optional(),
  shipping_roles: z.array(shippingMethodSettingSchema).optional(),
});

export const registrationFieldSchema = fieldSchema;

export type Settings = z.infer<typeof settingsFormSchema>;
