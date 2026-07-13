import { z } from 'zod';
import { __ } from '@wordpress/i18n';

import { enableByRoleSchema } from './common.schema';

export const promotionRuleSchema = z.object({
  title: z.string().min(1, __('Title is required', 'yay-wholesale-b2b')),
  enableStatus: z.boolean(),

  fromRoles: enableByRoleSchema,
  newRole: z.tuple([
    z.enum(['retailers', 'wholesalers']),
    z.string().optional(), // Wholesale RoleSlug
  ]),

  condition: z.enum([
    'total-spend-at-least', // >=
    'last-year-spend-at-least', // >=
    'last-year-spend-less-than', // <
    'last-month-spend-at-least', // >=
    'last-month-spend-less-than', // <
  ]),
  conditionAmount: z.number().positive(__('Amount must be a positive number', 'yay-wholesale-b2b')),
});

export const promotionSettingsSchema = z.object({
  promotionRules: z.array(promotionRuleSchema),
});

export type PromotionRuleFormValues = z.infer<typeof promotionRuleSchema>;
export type PromotionSettings = z.infer<typeof promotionSettingsSchema>;
