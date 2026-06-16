import { api } from '@/lib/api/api';
import type { Role, RoleFormValues, UserCountByRole } from '@/lib/schema/roles.schema';
import { Settings } from '@/lib/schema/settings.schema';
import { PromotionRules } from '../schema/promotion.schema';

export function getAllRoles() {
  return api.get('roles').json<Role[]>();
}

export function addRole(data: RoleFormValues) {
  return api.post('roles', { json: data }).json<{ roles: Role[]; settings: Settings }>();
}

export function updateRole(roleSlug: string, data: RoleFormValues) {
  return api.put(`roles/${roleSlug}`, { json: data }).json<{ roles: Role[]; settings: Settings }>();
}

export function updateRoleStatus(roleSlug: string, status: boolean) {
  return api.put(`roles/${roleSlug}`, { json: { role: { status } } }).json<{ roles: Role[]; settings: Settings }>();
}

export function deleteRole(roleSlug: string) {
  return api.delete(`roles/${roleSlug}`).json<{ roles: Role[]; settings: Settings }>();
}

export function bulkDeleteRoles(roleSlugs: string[]) {
  return api.delete('roles/bulk-delete', { json: { roleSlugs } }).json<{ roles: Role[]; settings: Settings }>();
}

export function bulkUpdateRoleStatus(roleSlugs: string[], status: boolean) {
  return api.put('roles/bulk-status', { json: { roleSlugs, status } }).json<Role[]>();
}

export function countRolesUser() {
  return api.get('roles/count-users').json<UserCountByRole>();
}

// TODO v1.2: add API
export function getPromotionRule() {
  return api.get('roles/promotion-rules').json<PromotionRules>();
}

export function updatePromotionRule(data: PromotionRules) {
  return api.put('roles/promotion-rules', { json: data }).json<{ promotionRules: PromotionRules; roles: Role[] }>();
}
