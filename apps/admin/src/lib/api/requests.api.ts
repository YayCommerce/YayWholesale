import { __ } from '@wordpress/i18n';

import { PaginatedRequestListValues, RequestFormValues } from '../schema/requests';
import { api, handleResponse } from './base';

export async function fetchRequests(
  keyword: string,
  page: number,
  perPage: number,
  status: string,
) {
  const searchParams = new URLSearchParams({
    kw: keyword,
    page: String(page),
    per_page: String(perPage),
    status: status,
  });

  const response = await api.get('requests', { searchParams });
  const result = await handleResponse<PaginatedRequestListValues>(
    response,
    __('Failed to fetch requests', 'yay-wholesale'),
  );
  return result.data ?? {};
}

export async function fetchRequestById(requestId: number) {
  const response = await api.get(`requests/${requestId}`);
  const result = await handleResponse<RequestFormValues>(
    response,
    __('Failed to fetch request', 'yay-wholesale'),
  );
  return result.data;
}

export async function updateRequestById(data: RequestFormValues, requestId: number) {
  const response = await api.put(`requests/${requestId}`, { json: data });
  const result = await handleResponse<RequestFormValues>(
    response,
    __('Failed to update request', 'yay-wholesale'),
  );
  return result;
}

export async function deleteRequestById(requestId: number) {
  const response = await api.delete(`requests/${requestId}`);
  const result = await handleResponse<RequestFormValues>(
    response,
    __('Failed to delete request', 'yay-wholesale'),
  );
  return result;
}

export async function updateRequestStatusById(
  requestId: number,
  status: RequestFormValues['status'],
  roleId: number,
) {
  let data = { status, role_id: roleId };

  const response = await api.put(`requests/${requestId}/status`, { json: data });
  const result = await handleResponse<RequestFormValues>(
    response,
    __('Failed to update request status', 'yay-wholesale'),
  );

  return result;
}

export async function bulkUpdateRequestStatus(
  requestIds: number[],
  status: RequestFormValues['status'],
  roleId: number,
) {
  let data = { ids: requestIds, status, role_id: roleId };

  const response = await api.put('requests/bulk-status', { json: data });
  const result = await handleResponse<RequestFormValues>(
    response,
    __('Failed to update request status', 'yay-wholesale'),
  );

  return result;
}

export async function bulkDeleteRequest(requestIds: number[]) {
  let data = { ids: requestIds };

  const response = await api.delete('requests/bulk-delete', { json: data });
  const result = await handleResponse<RequestFormValues>(
    response,
    __('Failed to update request status', 'yay-wholesale'),
  );

  return result;
}
