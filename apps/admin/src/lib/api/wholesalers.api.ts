import { PaginatedWholesalerListValues, TotalWholesalersValues } from '../schema/wholesalers.type';
import { api } from './api';
import type { ApiResponse } from './api.type';

export async function fetchWholesalersList(search: string, page: number, perPage: number, role: string) {
  const searchParams = new URLSearchParams({
    search: search,
    page: String(page),
    per_page: String(perPage),
    role: role,
  });
  return await api.get('wholesalers', { searchParams }).json<ApiResponse<PaginatedWholesalerListValues>>();
}

export async function updateWholesalerRole(userId: number, roleSlug: string) {
  return await api.put(`wholesalers/${userId}`, { json: { role_slug: roleSlug } }).json<ApiResponse<boolean>>();
}

export async function bulkUpdateWholesalerRole(userIds: number[], roleSlug: string) {
  return await api
    .put('wholesalers/bulk-role', { json: { ids: userIds, role_slug: roleSlug } })
    .json<ApiResponse<boolean>>();
}

export async function getTotalCountWholesalers() {
  return await api.get('wholesalers/total').json<ApiResponse<TotalWholesalersValues>>();
}
