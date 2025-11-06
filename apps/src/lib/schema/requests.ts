import z from 'zod';

const RequestStatusSchema = z.enum(['approved', 'pending', 'rejected']);

const RequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  status: RequestStatusSchema,
  date: z.string(),
  avatar: z.string(),
});

const PaginatedRequestSchema = z.object({
  curPage: z.number(),
  firstPage: z.number(),
  lastPage: z.number(),
  canNext: z.boolean(),
  canPre: z.boolean(),
  data_list: z.array(RequestSchema),
});

export type RequestListValues = z.infer<typeof RequestSchema>;

export type PaginatedRequestListValues = z.infer<typeof PaginatedRequestSchema>;

export type RequestStatusValues = z.infer<typeof RequestStatusSchema>;
