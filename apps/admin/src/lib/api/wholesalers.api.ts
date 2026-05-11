import { Wholesaler, WholesalerFilter } from '../schema/wholesalers.type';
import { api } from './api';
import { PaginatedResponse } from './api.type';

export function getWholesalers(filter: WholesalerFilter) {
  const searchParams = new URLSearchParams({
    search: filter.search,
    page: String(filter.page),
    per_page: String(filter.perPage),
    ...(filter.roleSlug ? { role_slug: filter.roleSlug } : {}),
  });
  return api.get('wholesalers', { searchParams }).json<PaginatedResponse<Wholesaler>>();
}

export function updateWholesalerRole(userId: number, roleSlug: string) {
  return api.put(`wholesalers/${userId}/update-role`, { json: { roleSlug } }).json<boolean>();
}

export function bulkUpdateWholesalerRole(userIds: number[], roleSlug: string) {
  return api.put('wholesalers/bulk-update-role', { json: { userIds, roleSlug } }).json<number>();
}
