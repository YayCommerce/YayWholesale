import z from 'zod';

export const wholesalerSchema = z.object({
  id: z.number(),
  userName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string(),
  avatar: z.string(),
  email: z.string().email(),
  role: z.string(),
  completedOrdersCount: z.number().optional(),
  wholesaleRevenue: z.number().optional(),
});

const paginatedWholesalerSchema = z.object({
  currentPage: z.number(),
  totalPage: z.number(),
  totalItems: z.number(),
  data: z.array(wholesalerSchema),
});

const totalWholesalersSchema = z.object({
  count: z.number(),
});

export type WholesalerFormValues = z.infer<typeof wholesalerSchema>;

export type PaginatedWholesalerListValues = z.infer<typeof paginatedWholesalerSchema>;

export type TotalWholesalersValues = z.infer<typeof totalWholesalersSchema>;
