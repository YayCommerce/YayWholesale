import { z } from 'zod';
import { __ } from '@wordpress/i18n';

const fieldSchema = z.object({
  id: z.string(),
  label: z
    .string()
    .min(1, __('Fill in the field label', 'yay-wholesale-b2b'))
    .regex(
      /^[\p{L}0-9 _\-&:/]+$/u,
      __('Label can only contain letters, numbers, spaces, and common symbols (-, _, &, :, /.).', 'yay-wholesale-b2b'),
    ),
  inputName: z.string(),
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
    tax_display_mode: z.string(),
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
            message: __('Label must be unique', 'yay-wholesale-b2b'),
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
