import { api } from '@/lib/api/api';
import type { Role, RoleFormValues, RoleUserCount } from '@/lib/schema/roles.schema';
import type { ApiResponse } from './api.type';

export function getAllRoles() {
  return api.get('roles').json<ApiResponse<Role[]>>();
}

export function addRole(data: RoleFormValues) {
  return api.post('roles', { json: data }).json<ApiResponse<Role[]>>();
}

export function updateRole(roleId: number, data: RoleFormValues) {
  return api.put(`roles/${roleId}`, { json: data }).json<ApiResponse<Role[]>>();
}

export function updateRoleStatus(roleId: number, status: boolean) {
  return api.put(`roles/${roleId}`, { json: { status } }).json<ApiResponse<Role[]>>();
}

export function deleteRole(roleId: number) {
  return api.delete(`roles/${roleId}`).json<ApiResponse<Role[]>>();
}

export function bulkDeleteRoles(ids: number[]) {
  return api.delete('roles/bulk-delete', { json: { ids } }).json<ApiResponse<Role[]>>();
}

export function bulkUpdateRoleStatus(ids: number[], status: boolean) {
  return api.put('roles/bulk-status', { json: { ids, status } }).json<ApiResponse<Role[]>>();
}

export function countRolesUser() {
  return api.get('roles/count-users').json<ApiResponse<RoleUserCount>>();
}
