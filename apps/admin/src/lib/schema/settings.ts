import { __ } from '@wordpress/i18n';
import { z } from 'zod';

const fieldSchema = z.object({
  id: z.string(),
  label: z
    .string()
    .min(1, __('Fill in the field label', 'yay-wholesale'))
    .regex(/^[a-zA-Z0-9 ]+$/, __('Label must contain only letters and numbers', 'yay-wholesale')),
  type: z.string(),
  placeholder: z.string(),
  columnWidth: z.string(),
  deletable: z.boolean(),
  isDefault: z.boolean(),
  isRequired: z.boolean(),
  isHidden: z.boolean(),
});

export const settingsFormSchema = z.object({
  general: z.object({
    default_role: z.string(),
    show_wholesale_price: z.boolean(),
    disable_coupon: z.boolean(),
    disable_tax: z.boolean(),
  }),
  display: z.object({
    price_format: z.string(),
    wholesale_price_label: z.string(),
    wholesale_price_color: z.string(),
  }),
  registration: z.object({
    moderate: z.boolean(),
    wholesale_registration_page: z.string(),
    submit_button_label: z.string(),
    successful_registration_message: z.string(),
  }),
  registration_fields: z.object({
    fields: z.array(fieldSchema).superRefine((fields, ctx) => {
      const existedLabels = new Set<string>();

      fields.forEach((field, index) => {
        if (existedLabels.has(field.label.toLowerCase())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: __('Label must be unique', 'yay-wholesale'),
            path: [index, 'label'], // direct to the duplicate label and show error
          });
        } else {
          existedLabels.add(field.label.toLowerCase());
        }
      });
    }),
  }),
});
export type SettingsFormData = z.infer<typeof settingsFormSchema>;
