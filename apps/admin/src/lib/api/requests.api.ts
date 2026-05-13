import { CountRequestByStatus, Request, RequestFilter } from '../schema/requests.type';
import { api } from './api';
import type { PaginatedResponse } from './api.type';

export function getRequests(filter: RequestFilter) {
  const searchParams = new URLSearchParams({
    search: filter.search,
    page: String(filter.page),
    per_page: String(filter.perPage),
    status: filter.status,
  });
  return api.get('requests', { searchParams }).json<PaginatedResponse<Request>>();
}

export function getRequestById(requestId: number) {
  return api.get(`requests/${requestId}`).json<Request>();
}

export function approveRequest(requestId: number, roleSlug: string) {
  return api.put(`requests/${requestId}/approve`, { json: { roleSlug } }).json<Request>();
}

export function bulkApproveRequest(requestIds: number[], roleSlug: string) {
  return api.put('requests/bulk-approve', { json: { requestIds, roleSlug } }).json<number>();
}

export function rejectRequest(requestId: number) {
  return api.put(`requests/${requestId}/reject`).json<Request>();
}

export function bulkRejectRequest(requestIds: number[]) {
  return api.put('requests/bulk-reject', { json: { requestIds } }).json<number>();
}

export function deleteRequest(requestId: number) {
  return api.delete(`requests/${requestId}`).json<boolean>();
}

export function bulkDeleteRequest(requestIds: number[]) {
  return api.delete(`requests/bulk-delete`, { json: { requestIds } }).json<number>();
}

export function countRequestByStatus() {
  return api.get('requests/count-by-status').json<CountRequestByStatus>();
}
