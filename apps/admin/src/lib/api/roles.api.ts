import { __ } from '@wordpress/i18n';

import { api, ApiResponse, handleResponse } from '@/lib/api/base';
import type { RoleFormValues, RolesListValues } from '@/lib/schema/roles';

// get all roles

export async function fetchRoles() {
  const response = await api.get('roles');
  const result = await handleResponse<RolesListValues[]>(
    response,
    __('Failed to fetch roles', 'yay-wholesale'),
  );
  return result.data ?? [];
}

export async function fetchActiveRoles() {
  const response = await api.get('roles?active=true');
  const result = await handleResponse<RolesListValues[]>(
    response,
    __('Failed to fetch roles', 'yay-wholesale'),
  );
  return result.data ?? [];
}

// get role by id
export async function fetchRole(roleId: number) {
  const response = await api.get(`roles/${roleId}`);
  const result = await handleResponse<RoleFormValues>(
    response,
    __('Failed to fetch role', 'yay-wholesale'),
  );
  return result.data;
}

// create new role
export async function postRole(data: RoleFormValues) {
  const response = await api.post('roles', { json: data });
  const result = await handleResponse<RoleFormValues>(
    response,
    __('Failed to create role', 'yay-wholesale'),
  );
  return result;
}

// update role
export async function updateRole(data: RoleFormValues, roleId: number) {
  const response = await api.put(`roles/${roleId}`, { json: data });
  const result = await handleResponse<RoleFormValues>(
    response,
    __('Failed to update role', 'yay-wholesale'),
  );
  return result;
}

// delete role
export async function deleteRole(id: number) {
  const response = await api.delete(`roles/${id}`);
  const result = await handleResponse<RolesListValues[]>(
    response,
    __('Failed to delete role', 'yay-wholesale'),
  );
  return result;
}

// delete many roles
export async function deleteManyRoles(ids: number[]) {
  const response = await api.delete('roles/bulk', { json: { ids } });
  const result = await handleResponse<RolesListValues[]>(
    response,
    __('Failed to bulk delete roles', 'yay-wholesale'),
  );
  return result;
}

// update role status
export async function updateRoleStatus(id: number, status: boolean) {
  const response = await api.put(`roles/${id}`, { json: { status } });
  const result = await handleResponse<RolesListValues>(
    response,
    __('Failed to update role status', 'yay-wholesale'),
  );
  return result;
}

// bulk update role status
export async function bulkUpdateRoleStatus(ids: number[], status: boolean) {
  const response = await api.put('roles/bulk-status', { json: { ids, status } });
  const result = await handleResponse<RolesListValues[]>(
    response,
    __('Failed to bulk update role status', 'yay-wholesale'),
  );
  return result;
}
