import { api } from '@/lib/api/api';
import type { Role, RoleFormValues, UserCountByRole } from '@/lib/schema/roles.schema';

export function getAllRoles() {
  return api.get('roles').json<Role[]>();
}

export function addRole(data: RoleFormValues) {
  return api.post('roles', { json: data }).json<Role[]>();
}

export function updateRole(roleSlug: string, data: RoleFormValues) {
  return api.put(`roles/${roleSlug}`, { json: data }).json<Role[]>();
}

export function updateRoleStatus(roleSlug: string, status: boolean) {
  return api.put(`roles/${roleSlug}`, { json: { status } }).json<Role[]>();
}

export function deleteRole(roleSlug: string) {
  return api.delete(`roles/${roleSlug}`).json<Role[]>();
}

export function bulkDeleteRoles(roleSlugs: string[]) {
  return api.delete('roles/bulk-delete', { json: { roleSlugs } }).json<Role[]>();
}

export function bulkUpdateRoleStatus(roleSlugs: string[], status: boolean) {
  return api.put('roles/bulk-status', { json: { roleSlugs, status } }).json<Role[]>();
}

export function countRolesUser() {
  return api.get('roles/count-users').json<UserCountByRole>();
}
