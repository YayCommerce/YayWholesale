import { z } from 'zod';

export const enableByRoleSchema = z.object({
  retailers: z.enum(['enabled', 'disabled']),
  wholesalers: z.enum(['enabled', 'disabled', 'enabled-selected-roles']),
  selected_roles: z.array(z.string()), // RoleSlug[]
});

// TODO v1.2: add to Product Option, Category Option
const accessByRoleSchema = z.object({
  rule: z.enum(['visible-all', 'visible-specific-roles']),
  retailers: z.enum(['enabled', 'disabled']),
  wholesalers: z.enum(['enabled', 'disabled', 'enabled-selected-roles']),
  selected_roles: z.array(z.string()), // RoleSlug[]
});

export type EnableByRole = z.infer<typeof enableByRoleSchema>;
export type AccessByRole = z.infer<typeof accessByRoleSchema>;
