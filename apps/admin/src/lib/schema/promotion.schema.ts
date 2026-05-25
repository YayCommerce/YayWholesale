import { z } from 'zod';

export const promotionSchema = z.object({
  enableAutoPromotion: z.boolean(),
  enablePromotionFromRetailers: z.boolean(),

  roleRanking: z.array(z.string()), // RoleSlug[]
  rolePromotionCondition: z.record(
    z.string(), // RoleSlug
    z.object({
      enableStatus: z.boolean(),
      minTotalSpending: z.number(),
      inDuration: z.enum(['no-limit', '1-month', '3-months', '6-months', '1-year']),
    }),
  ),
});

export type PromotionSettings = z.infer<typeof promotionSchema>;
