import z from 'zod';

export const RequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  status: z.enum(['approved', 'pending', 'rejected']),
  date: z.string(),
  avatar: z.string(),
});

export type RequestListValues = z.infer<typeof RequestSchema>;
