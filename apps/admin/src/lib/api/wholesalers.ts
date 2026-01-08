import { __ } from '@wordpress/i18n';

import { PaginatedWholesalerListValues, TotalWholesalersValues } from '../schema/wholesalers';
import { api, handleResponse } from './base';

export async function fetchWholesalersList(
  search: string,
  page: number,
  perPage: number,
  role: string,
) {
  const searchParams = new URLSearchParams({
    search: search,
    page: String(page),
    per_page: String(perPage),
    role: role,
  });

  const response = await api.get('wholesalers', { searchParams });
  const result = await handleResponse<PaginatedWholesalerListValues>(
    response,
    __('Failed to fetch wholesalers', 'yay-wholesale'),
  );
  return result.data ?? {};
}

export async function updateWholesalerRole(userId: number, roleSlug: string) {
  let data = { role_slug: roleSlug };
  const response = await api.put(`wholesalers/${userId}`, { json: data });
  const result = await handleResponse<{ message: string }>(
    response,
    __('Failed to update wholesaler role', 'yay-wholesale'),
  );

  return result;
}

export async function bulkUpdateWholesalerRole(userIds: number[], roleSlug: string) {
  let data = { ids: userIds, role_slug: roleSlug };

  const response = await api.put('wholesalers/bulk-role', { json: data });
  const result = await handleResponse<{ message: string }>(
    response,
    __('Failed to update wholesaler role', 'yay-wholesale'),
  );

  return result;
}

export async function getTotalCountWholesalers() {
  const response = await api.get('wholesalers/total');
  const result = await handleResponse<TotalWholesalersValues>(
    response,
    __('Failed to count the totals of wholesalers', 'yay-wholesale'),
  );
  return result.data;
}
