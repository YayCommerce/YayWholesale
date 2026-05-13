import { z } from 'zod';

// TODO: apply to payment method, shipping method
const enableByRoleSchema = z.object({
  retailers: z.enum(['enabled', 'disabled']),
  wholesalers: z.enum(['enabled', 'disabled', 'disabled-specific-roles']),
  disabled_specific_roles: z.array(z.string()), // RoleSlug[]
});

type EnableByRole = z.infer<typeof enableByRoleSchema>;

// TODO: add to settings
type AccessRestriction = {
  guest: 'hide-prices' | 'hide-shop' | 'no-restriction';
  retailers: 'hide-wholesale-prices' | 'show-wholesale-prices';
};

/**
 * TODO: remove role.applyToSalePrice
 */
type Display = {
  price_format: 'retail-and-wholesale' | 'wholesale-only' | 'apply-sale-price';
};
