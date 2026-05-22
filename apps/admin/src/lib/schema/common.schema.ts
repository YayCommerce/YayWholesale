import { z } from 'zod';

// TODO v1.1: apply to payment method, shipping method
const enableByRoleSchema = z.object({
  retailers: z.enum(['enabled', 'disabled']),
  wholesalers: z.enum(['enabled', 'disabled', 'enabled-selected-roles']),
  selected_roles: z.array(z.string()), // RoleSlug[]
});

type EnableByRole = z.infer<typeof enableByRoleSchema>;

// TODO: add to settings
type AccessRestriction = {
  guest: 'hide-prices' | 'hide-shop' | 'no-restriction';
  retailers: 'hide-wholesale-prices' | 'show-wholesale-prices';
};

/**
 * TODO:
 */
type Display = {
  price_format: 'retail-and-wholesale' | 'wholesale-only' | 'retail-only';
};
