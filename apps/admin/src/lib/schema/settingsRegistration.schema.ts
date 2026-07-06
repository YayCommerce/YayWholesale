import { z } from 'zod';
import { __ } from '@wordpress/i18n';

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

  // systemField: z.enum(systemFields).optional(),
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

export const fieldSchema = z.discriminatedUnion('type', [textFieldSchema, choiceFieldSchema, attachmentFieldSchema]);

export { textFieldTypes, choiceFieldTypes, attachmentFieldTypes };

export type TextField = z.infer<typeof textFieldSchema>;
export type ChoiceField = z.infer<typeof choiceFieldSchema>;
export type AttachmentField = z.infer<typeof attachmentFieldSchema>;
export type Field = z.infer<typeof fieldSchema>;
export type FieldType = Field['type'] | ChoiceField['type'] | AttachmentField['type'];

export type FieldFormValues = z.infer<typeof fieldSchema>;
