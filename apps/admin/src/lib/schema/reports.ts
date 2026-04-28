import { z } from 'zod';

const topWholesaler = z.object({
  id: z.number(),
  name: z.string(),
  avatar: z.string(),
  role: z.string(),
  orderCount: z.number(),
});

const topProduct = z.object({
  name: z.string(),
  image: z.string(),
  orderCount: z.number(),
  netSale: z.string(),
});

export const reportsSchema = z.object({
  wholesalersAmount: z.number(),
  wholesalersIncreaseRate: z.number(),
  orderAmount: z.number(),
  orderIncreaseRate: z.number(),
  revenue: z.number(),
  revenueIncreaseRate: z.number(),
  topWholesalers: z.array(topWholesaler),
  topProducts: z.array(topProduct),
});

export type DashboardReportsValue = z.infer<typeof reportsSchema>;
export type TopWholesalerValue = z.infer<typeof topWholesaler>;
export type TopProductValue = z.infer<typeof topProduct>;
