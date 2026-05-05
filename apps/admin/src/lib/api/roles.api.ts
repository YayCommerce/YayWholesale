import { api } from '@/lib/api/api';
import type { Role, RoleFormValues } from '@/lib/schema/roles.schema';
import type { ApiResponse } from './api.type';

export async function getAllRoles() {
  return await api.get('roles').json<ApiResponse<RolesListValues[]>>();
}

export async function createRole(data: RoleFormValues) {
  return await api.post('roles', { json: data }).json<ApiResponse<RoleFormValues>>();
}

export async function updateRole(roleId: number, data: RoleFormValues) {
  return await api.put(`roles/${roleId}`, { json: data }).json<ApiResponse<RoleFormValues>>();
}

export async function deleteRole(id: number) {
  return await api.delete(`roles/${id}`).json<ApiResponse<boolean>>();
}

export async function deleteManyRoles(ids: number[]) {
  return await api.delete('roles/bulk', { json: { ids } }).json<ApiResponse<number>>();
}

export async function updateRoleStatus(id: number, status: boolean) {
  return await api.put(`roles/${id}`, { json: { status } }).json<ApiResponse<RolesListValues>>();
}

export async function bulkUpdateRoleStatus(ids: number[], status: boolean) {
  return await api.put('roles/bulk-status', { json: { ids, status } }).json<ApiResponse<number>>();
}
