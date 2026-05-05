import { PaginatedRequestListValues, RequestFormValues, RequestsCountValues } from '../schema/requests.type';
import { api } from './api';
import type { ApiResponse } from './api.type';

export async function fetchRequests(keyword: string, page: number, perPage: number, status: string) {
  const searchParams = new URLSearchParams({
    kw: keyword,
    page: String(page),
    per_page: String(perPage),
    status: status,
  });
  return await api.get('requests', { searchParams }).json<ApiResponse<PaginatedRequestListValues>>();
}

export async function fetchRequestById(requestId: number) {
  return await api.get(`requests/${requestId}`).json<ApiResponse<RequestFormValues>>();
}

export async function updateRequestById(data: RequestFormValues, requestId: number) {
  return await api.put(`requests/${requestId}`, { json: data }).json<ApiResponse<boolean>>();
}

export async function deleteRequestById(requestId: number) {
  return await api.delete(`requests/${requestId}`).json<ApiResponse<boolean>>();
}

export async function updateRequestStatusById(requestId: number, status: RequestFormValues['status'], roleId: number) {
  const data = { role_id: roleId };

  if (status === 'approved') {
    return await api.put(`requests/${requestId}/approve`, { json: data }).json<ApiResponse<boolean>>();
  } else {
    return await api.put(`requests/${requestId}/reject`, { json: data }).json<ApiResponse<boolean>>();
  }
}

export async function bulkUpdateRequestStatus(
  requestIds: number[],
  status: RequestFormValues['status'],
  roleId: number,
) {
  const data = { ids: requestIds, role_id: roleId };

  if (status === 'approved') {
    return await api.put('requests/bulk-approve', { json: data }).json<ApiResponse<boolean>>();
  } else {
    return await api.put('requests/bulk-reject', { json: data }).json<ApiResponse<boolean>>();
  }
}

export async function bulkDeleteRequest(requestIds: number[]) {
  return await api.delete('requests/bulk-delete', { json: { ids: requestIds } }).json<ApiResponse<boolean>>();
}

export async function getPendingCount() {
  return await api.get('requests/pending').json<ApiResponse<RequestsCountValues>>();
}

export async function getTotalCount() {
  return await api.get('requests/total').json<ApiResponse<RequestsCountValues>>();
}
