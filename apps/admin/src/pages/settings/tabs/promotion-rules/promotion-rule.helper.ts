import { __ } from '@wordpress/i18n';

import { parseWPCurrency } from '@/lib/helpers/format.helper';
import type { PromotionRuleFormValues } from '@/lib/schema/promotion.schema';
import { Role } from '@/lib/schema/roles.schema';

export const PROMOTION_CONDITIONS = [
  {
    value: 'total-spend-at-least',
    label: __('Total order value is at least', 'yay-wholesale-b2b'),
    summary: __('Total spent ≥ %s', 'yay-wholesale-b2b'),
  },
  {
    value: 'last-year-spend-at-least',
    label: __('Previous year order value is at least', 'yay-wholesale-b2b'),
    summary: __('Previous year spend ≥ %s', 'yay-wholesale-b2b'),
  },
  {
    value: 'last-year-spend-less-than',
    label: __('Previous year order value is less than', 'yay-wholesale-b2b'),
    summary: __('Previous year spend < %s', 'yay-wholesale-b2b'),
  },
  {
    value: 'last-month-spend-at-least',
    label: __('Previous month order value is at least', 'yay-wholesale-b2b'),
    summary: __('Previous month spend ≥ %s', 'yay-wholesale-b2b'),
  },
  {
    value: 'last-month-spend-less-than',
    label: __('Previous month order value is less than', 'yay-wholesale-b2b'),
    summary: __('Previous month spend < %s', 'yay-wholesale-b2b'),
  },
];

export function getPromotionFromRolesLabel(rule: PromotionRuleFormValues, roles: Role[]): string {
  const labels: string[] = [];

  if (rule.fromRoles.retailers === 'enabled') {
    labels.push(__('Retail Customers (B2C)', 'yay-wholesale-b2b'));
  }

  if (rule.fromRoles.wholesalers === 'enabled') {
    labels.push(__('Wholesale Customers (B2B)', 'yay-wholesale-b2b'));
  }

  if (rule.fromRoles.wholesalers !== 'enabled' && rule.fromRoles.selected_roles.length) {
    labels.push(...rule.fromRoles.selected_roles.map((slug) => roles.find((r) => r.slug === slug)?.name ?? slug));
  }

  return labels.join(', ');
}

export function getPromotionNewRoleLabel(rule: PromotionRuleFormValues, roles: Role[]): string {
  if (rule.newRole[0] === 'retailers') {
    return __('Retail Customers (B2C)', 'yay-wholesale-b2b');
  }

  const role = roles.find((r) => r.slug === rule.newRole[1]);

  return role?.name ?? rule.newRole[1] ?? __('Unknown role', 'yay-wholesale-b2b');
}

export function getPromotionSummaryItems(rule: PromotionRuleFormValues, activeRoles: Role[]) {
  const summary = PROMOTION_CONDITIONS.find((c) => c.value === rule.condition)?.summary;

  return [
    summary?.replace('%s', parseWPCurrency(rule.conditionAmount)),
    __('From Roles: ', 'yay-wholesale-b2b') + getPromotionFromRolesLabel(rule, activeRoles),
    __('New Role: ', 'yay-wholesale-b2b') + getPromotionNewRoleLabel(rule, activeRoles),
  ];
}
