import { api } from '@/lib/api/api';
import type { Role, RoleFormValues, UserCountByRole } from '@/lib/schema/roles.schema';

export function getAllRoles() {
  return api.get('roles').json<Role[]>();
}

export function addRole(data: RoleFormValues) {
  return api.post('roles', { json: data }).json<Role[]>();
}

export function updateRole(roleId: number, data: RoleFormValues) {
  return api.put(`roles/${roleId}`, { json: data }).json<Role[]>();
}

export function updateRoleStatus(roleId: number, status: boolean) {
  return api.put(`roles/${roleId}`, { json: { status } }).json<Role[]>();
}

export function deleteRole(roleId: number) {
  return api.delete(`roles/${roleId}`).json<Role[]>();
}

export function bulkDeleteRoles(ids: number[]) {
  return api.delete('roles/bulk-delete', { json: { ids } }).json<Role[]>();
}

export function bulkUpdateRoleStatus(ids: number[], status: boolean) {
  return api.put('roles/bulk-status', { json: { ids, status } }).json<Role[]>();
}

export function countRolesUser() {
  return api.get('roles/count-users').json<UserCountByRole>();
}
