import { __ } from '@wordpress/i18n';
import z from 'zod';

const requestFieldsSchema = z.object({
  label: z.string(),
  value: z.string(),
  type: z.string(),
});

export const requestSchema = z.object({
  id: z.number(),
  name: z.string().min(1, __('Please fill in the name', 'yay-wholesale')),
  email: z
    .string()
    .min(1, __('Please fill in the email', 'yay-wholesale'))
    .regex(/^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/, __('Invalid Email Format', 'yay-wholesale')),
  message: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  status: z.enum(['approved', 'pending', 'rejected']),
  date: z.string(),
  avatar: z.string(),
  fields: z.array(requestFieldsSchema),
});

const paginatedRequestSchema = z.object({
  currentPage: z.number(),
  totalPage: z.number(),
  data: z.array(requestSchema),
});

const pendingCountSchema = z.object({
  count: z.number(),
});

export type RequestFormValues = z.infer<typeof requestSchema>;

export type PaginatedRequestListValues = z.infer<typeof paginatedRequestSchema>;

export type PendingCountValues = z.infer<typeof pendingCountSchema>;
