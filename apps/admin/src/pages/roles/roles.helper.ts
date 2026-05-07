import { Role } from '@/lib/schema/roles.schema';

export function isDefaultRole(role: Role) {
  const defaultRoleSlug = window.yayWholesaleB2BAdmin.settings.general.default_role;
  return defaultRoleSlug === role.slug;
}
