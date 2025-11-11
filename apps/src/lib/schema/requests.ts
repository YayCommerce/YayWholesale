import { __ } from '@wordpress/i18n';
import z from 'zod';

const RequestStatusSchema = z.enum(['approved', 'pending', 'rejected']);
const RequestFieldsSchema = z.object({
  label: z.string(),
  value: z.string(),
  type: z.string(),
});

export const RequestSchema = z.object({
  id: z.number(),
  name: z.string().min(1, __('Please fill in the name', 'yay-wholesale')),
  email: z
    .string()
    .min(1, __('Please fill in the email', 'yay-wholesale'))
    .regex(/^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/, __('Invalid Email Format', 'yay-wholesale')),
  message: z.string(),
  status: RequestStatusSchema,
  date: z.string(),
  avatar: z.string(),
  fields: z.array(RequestFieldsSchema),
});

const PaginatedRequestSchema = z.object({
  curPage: z.number(),
  firstPage: z.number(),
  lastPage: z.number(),
  canNext: z.boolean(),
  canPre: z.boolean(),
  data_list: z.array(RequestSchema),
});

export type RequestFormValues = z.infer<typeof RequestSchema>;

export type PaginatedRequestListValues = z.infer<typeof PaginatedRequestSchema>;

export type RequestStatusValues = z.infer<typeof RequestStatusSchema>;
