import { __ } from '@wordpress/i18n';

import { PaginatedRequestListValues, RequestFormValues, RequestsCountValues } from '../schema/requests';
import { api, handleResponse } from './base';

export async function fetchRequests(keyword: string, page: number, perPage: number, status: string) {
  const searchParams = new URLSearchParams({
    kw: keyword,
    page: String(page),
    per_page: String(perPage),
    status: status,
  });

  const response = await api.get('requests', { searchParams });
  const result = await handleResponse<PaginatedRequestListValues>(
    response,
    __('Failed to fetch requests', 'yay-wholesale-b2b'),
  );
  return result.data ?? {};
}

export async function fetchRequestById(requestId: number) {
  const response = await api.get(`requests/${requestId}`);
  const result = await handleResponse<RequestFormValues>(response, __('Failed to fetch request', 'yay-wholesale-b2b'));
  return result.data;
}

export async function updateRequestById(data: RequestFormValues, requestId: number) {
  const response = await api.put(`requests/${requestId}`, { json: data });
  const result = await handleResponse<RequestFormValues>(response, __('Failed to update request', 'yay-wholesale-b2b'));
  return result;
}

export async function deleteRequestById(requestId: number) {
  const response = await api.delete(`requests/${requestId}`);
  const result = await handleResponse<RequestFormValues>(response, __('Failed to delete request', 'yay-wholesale-b2b'));
  return result;
}

export async function updateRequestStatusById(requestId: number, status: RequestFormValues['status'], roleId: number) {
  let data = { role_id: roleId };

  if (status === 'approved') {
    const response = await api.put(`requests/${requestId}/approve`, { json: data });
    const result = await handleResponse<RequestFormValues>(
      response,
      __('Failed to update request status', 'yay-wholesale-b2b'),
    );

    return result;
  } else {
    const response = await api.put(`requests/${requestId}/reject`, { json: data });
    const result = await handleResponse<RequestFormValues>(
      response,
      __('Failed to update request status', 'yay-wholesale-b2b'),
    );

    return result;
  }
}

export async function bulkUpdateRequestStatus(
  requestIds: number[],
  status: RequestFormValues['status'],
  roleId: number,
) {
  let data = { ids: requestIds, role_id: roleId };

  if (status === 'approved') {
    const response = await api.put('requests/bulk-approve', { json: data });
    const result = await handleResponse<RequestFormValues>(
      response,
      __('Failed to update request status', 'yay-wholesale-b2b'),
    );
    return result;
  } else {
    const response = await api.put('requests/bulk-reject', { json: data });
    const result = await handleResponse<RequestFormValues>(
      response,
      __('Failed to update request status', 'yay-wholesale-b2b'),
    );
    return result;
  }
}

export async function bulkDeleteRequest(requestIds: number[]) {
  let data = { ids: requestIds };

  const response = await api.delete('requests/bulk-delete', { json: data });
  const result = await handleResponse<RequestFormValues>(
    response,
    __('Failed to update request status', 'yay-wholesale-b2b'),
  );

  return result;
}

export async function getPendingCount() {
  const response = await api.get('requests/pending');
  const result = await handleResponse<RequestsCountValues>(
    response,
    __('Failed to get the pending requests count', 'yay-wholesale-b2b'),
  );

  return result.data;
}

export async function getTotalCount() {
  const response = await api.get('requests/total');
  const result = await handleResponse<RequestsCountValues>(
    response,
    __('Failed to get the requests count', 'yay-wholesale-b2b'),
  );

  return result.data;
}
