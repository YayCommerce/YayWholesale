import { z } from 'zod';

const fieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string(),
  placeholder: z.string(),
  columnWidth: z.string(),
  deletable: z.boolean(),
  isDefault: z.boolean(),
  isRequired: z.boolean(),
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
    useDefaultForm: z.boolean(),
    fields: z.array(fieldSchema),
  }),
});
export type SettingsFormData = z.infer<typeof settingsFormSchema>;
