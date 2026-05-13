import { z } from 'zod';

/** TODO: apply to payment method, shipping method*/
export const enableByRoleSchema = z.object({
  retailers: z.enum(['enabled', 'disabled']),
  wholesalers: z.enum(['enabled', 'disabled', 'disabled_specific_roles']),
  disabled_specific_roles: z.array(z.string()), // RoleSlug[]
});

export type EnableByRole = z.infer<typeof enableByRoleSchema>;
