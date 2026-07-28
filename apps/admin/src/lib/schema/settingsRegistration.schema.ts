import { z } from 'zod';
import { __ } from '@wordpress/i18n';

const textFieldTypes = ['text', 'email', 'number', 'phone', 'date', 'textarea'] as const;
const choiceFieldTypes = ['radio', 'select', 'checkbox'] as const;
const attachmentFieldTypes = ['attachment'] as const;

const systemFields = ['firstname', 'lastname', 'email', 'company', 'vatId'] as const;

export const billingMappingValues = [
  '',
  'none',
  'billing_first_name',
  'billing_last_name',
  'billing_company',
  'billing_country_state',
  'billing_country',
  'billing_state',
  'billing_address_1',
  'billing_address_2',
  'billing_city',
  'billing_postcode',
  'billing_phone',
  'billing_vat',
  'custom',
] as const;

const commonFieldSchema = z.object({
  inputName: z.string(), // computed from label, unique across all fields. Before sending to API, we will generate the input name from the label
  label: z
    .string()
    .min(1, __('Fill in the field label', 'yay-wholesale-b2b'))
    .regex(
      /^[\p{L}0-9 _\-&:/]+$/u,
      __('Label can only contain letters, numbers, spaces, and common symbols (-, _, &, :, /.).', 'yay-wholesale-b2b'),
    ),

  // systemField: z.enum(systemFields).optional(),
  columnWidth: z.enum(['50%', '100%']),
  isRequired: z.boolean(),
  isHidden: z.boolean(),

  billingMapping: z.enum(billingMappingValues).optional(),
  customBillingMetaKey: z.string().optional(),
});

const textFieldSchema = z.object({
  ...commonFieldSchema.shape,
  type: z.enum(textFieldTypes),
  placeholder: z.string(),
});

const choiceFieldSchema = z.object({
  ...commonFieldSchema.shape,
  type: z.enum(choiceFieldTypes),
  choices: z.array(z.string()).nonempty(__('Add choices for the field', 'yay-wholesale-b2b')),
});

const fileExtension = z.enum(['jpg', 'jpeg', 'png', 'gif', 'txt', 'pdf', 'doc', 'docx', 'zip']);

const attachmentFieldSchema = z.object({
  ...commonFieldSchema.shape,
  type: z.enum(attachmentFieldTypes),
  allowedExtensions: z.array(fileExtension).nonempty(__('Add at least one allowed extension', 'yay-wholesale-b2b')),
  maxFileSize: z
    .number()
    .min(1, __('Max file size must be greater than 0', 'yay-wholesale-b2b'))
    .max(100, __('Max file size must be less than 100', 'yay-wholesale-b2b')),
});

const baseFieldSchema = z.discriminatedUnion('type', [textFieldSchema, choiceFieldSchema, attachmentFieldSchema]);

export const fieldSchema = baseFieldSchema.superRefine((field, ctx) => {
  if (field.billingMapping === 'custom' && !field.customBillingMetaKey.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['customBillingMetaKey'],
      message: __('Enter a user meta key', 'yay-wholesale-b2b'),
    });
  }
});

export { textFieldTypes, choiceFieldTypes, attachmentFieldTypes };

/**
 * Checks for duplicate WooCommerce billing field and custom meta key usage
 * across all registration fields. Adds appropriate Zod issues if duplicates are detected.
 */
export const registrationFieldsArraySchema = z.array(fieldSchema).superRefine((fields, ctx) => {
  const IGNORED_BILLING_MAPPINGS = new Set(['', 'none', 'custom']);

  // Stores the first occurrence (index) for built-in billing mapping
  const billingMappingToIndex = new Map<string, number>();
  // Stores the first occurrence (index) for custom meta key
  const customMetaKeyToIndex = new Map<string, number>();

  fields.forEach((field, idx) => {
    // Check for duplicated WooCommerce billing field mapping
    if (!IGNORED_BILLING_MAPPINGS.has(field.billingMapping)) {
      const existingIdx = billingMappingToIndex.get(field.billingMapping);
      if (existingIdx !== undefined) {
        const message = __(
          'This billing field is already connected to another registration field.',
          'yay-wholesale-b2b',
        );
        ctx.addIssue({ code: 'custom', path: [existingIdx, 'billingMapping'], message });
        ctx.addIssue({ code: 'custom', path: [idx, 'billingMapping'], message });
      } else {
        billingMappingToIndex.set(field.billingMapping, idx);
      }
    }

    // Check for duplicated custom user meta key
    if (field.billingMapping === 'custom') {
      const trimmedMetaKey = field.customBillingMetaKey.trim();
      if (trimmedMetaKey) {
        const existingIdx = customMetaKeyToIndex.get(trimmedMetaKey);
        if (existingIdx !== undefined) {
          const message = __('This user meta key is already used by another registration field.', 'yay-wholesale-b2b');
          ctx.addIssue({ code: 'custom', path: [existingIdx, 'customBillingMetaKey'], message });
          ctx.addIssue({ code: 'custom', path: [idx, 'customBillingMetaKey'], message });
        } else {
          customMetaKeyToIndex.set(trimmedMetaKey, idx);
        }
      }
    }
  });
});

export function createFieldFormSchema(siblingFields: FieldFormValues[], editingIndex?: number) {
  return fieldSchema.superRefine((field, ctx) => {
    // Construct a hypothetical array of all fields with this field added/edited
    const allFields =
      editingIndex !== undefined
        ? siblingFields.map((f, i) => (i === editingIndex ? field : f))
        : [...siblingFields, field];

    const targetIndex = editingIndex ?? allFields.length - 1;
    const validation = registrationFieldsArraySchema.safeParse(allFields);

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        const [issueIdx, ...restPath] = issue.path;
        if (Number(issueIdx) === targetIndex && restPath.length > 0) {
          ctx.addIssue({
            code: 'custom',
            path: restPath,
            message: issue.message,
          });
        }
      });
    }
  });
}

export type TextField = z.infer<typeof textFieldSchema>;
export type ChoiceField = z.infer<typeof choiceFieldSchema>;
export type AttachmentField = z.infer<typeof attachmentFieldSchema>;
export type Field = z.infer<typeof fieldSchema>;
export type FieldType = Field['type'] | ChoiceField['type'] | AttachmentField['type'];

export type FieldFormValues = z.infer<typeof fieldSchema>;
