import { __ } from '@wordpress/i18n';

import { api } from '@/lib/api/base';
import type { RoleFormValues, RolesListValues } from '@/lib/schema/roles';

// get all roles
export async function fetchRoles(): Promise<RolesListValues[]> {
  const response = await api.get('roles');
  if (!response.ok) throw new Error(__('Failed to fetch roles'));
  return response.json();
}

// get role by id
export async function fetchRole(roleId: string): Promise<RoleFormValues> {
  const response = await api.get(`roles/${roleId}`);
  if (!response.ok) throw new Error(__('Failed to fetch role'));
  return response.json();
}

// create new role
export async function postRole(data: RoleFormValues): Promise<RoleFormValues> {
  const response = await api.post('roles', { json: data });
  if (!response.ok) throw new Error(__('Failed to create role'));
  return response.json();
}

// update role
export async function updateRole(data: RoleFormValues, roleId: string): Promise<RoleFormValues> {
  const response = await api.put(`roles/${roleId}`, { json: data });
  if (!response.ok) throw new Error(__('Failed to update role'));
  return response.json();
}

// delete role
export async function deleteRole(id: string): Promise<void> {
  const response = await api.delete(`roles/${id}`);
  if (!response.ok) throw new Error(__('Failed to delete role'));
}

// delete many roles
export async function deleteManyRoles(ids: number[]): Promise<void> {
  const response = await api.delete('roles/bulk', { json: { ids } });
  if (!response.ok) throw new Error(__('Failed to bulk delete roles'));
}
