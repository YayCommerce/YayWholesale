import { z } from 'zod';
import { __ } from '@wordpress/i18n';

// TODD v1.2: add to settings, more field types, more system fields

const textFieldTypes = ['text', 'email', 'number', 'phone', 'date', 'textarea'] as const;
const choiceFieldTypes = ['radio', 'select', 'checkbox'] as const;
const attachmentFieldTypes = ['attachment'] as const;

const systemFields = ['firstname', 'lastname', 'email', 'company', 'vatId'] as const;

const commonFieldSchema = z.object({
  inputName: z.string(), // computed from label, unique across all fields. Before sending to API, we will generate the input name from the label
  label: z
    .string()
    .min(1, __('Fill in the field label', 'yay-wholesale-b2b'))
    .regex(
      /^[\p{L}0-9 _\-&:/]+$/u,
      __('Label can only contain letters, numbers, spaces, and common symbols (-, _, &, :, /.).', 'yay-wholesale-b2b'),
    ),

  systemField: z.enum(systemFields).optional(),
  columnWidth: z.enum(['50%', '100%']),
  isRequired: z.boolean(),
  isHidden: z.boolean(),
});

const textFieldSchema = z.object({
  ...commonFieldSchema.shape,
  type: z.enum(textFieldTypes),
  placeholder: z.string(),
});

const choiceFieldSchema = z.object({
  ...commonFieldSchema.shape,
  type: z.enum(choiceFieldTypes),
  choices: z.string().min(1, __('Add choices for the field', 'yay-wholesale-b2b')),
});

const attachmentFieldSchema = z.object({
  ...commonFieldSchema.shape,
  type: z.enum(attachmentFieldTypes),
  allowedExtensions: z.array(z.string()),
});

const fieldSchema = z.discriminatedUnion('type', [textFieldSchema, choiceFieldSchema, attachmentFieldSchema]);

export const fieldsSchema = z.array(fieldSchema).superRefine((fields, ctx) => {
  // 1. Check that each systemField is unique
  const systemFieldsUsed = new Set<string>();
  fields.forEach((field, index) => {
    if (field.systemField) {
      if (systemFieldsUsed.has(field.systemField)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: __('System field must be unique', 'yay-wholesale-b2b'),
          path: [index, 'systemField'],
        });
      } else {
        systemFieldsUsed.add(field.systemField);
      }
    }
  });
});

export { textFieldTypes, choiceFieldTypes, attachmentFieldTypes };

export type TextField = z.infer<typeof textFieldSchema>;
export type ChoiceField = z.infer<typeof choiceFieldSchema>;
export type AttachmentField = z.infer<typeof attachmentFieldSchema>;

export type Field = z.infer<typeof fieldSchema>;
