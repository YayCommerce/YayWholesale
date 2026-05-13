import { z } from 'zod';

/** TODO: new schema */
export const enableByRoleSchema = z.object({
  retailers: z.enum(['enabled', 'disabled']),
  wholesalers: z.enum(['enabled', 'disabled', 'disabled_specific_roles']),
  disabledWholesaleRoleSlugs: z.array(z.string()),
});

export type EnableByRole = z.infer<typeof enableByRoleSchema>;
