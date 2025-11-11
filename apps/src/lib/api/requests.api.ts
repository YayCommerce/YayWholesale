import { __ } from '@wordpress/i18n';

import { PaginatedRequestListValues, RequestFormValues } from '../schema/requests';
import { api, handleResponse } from './base';

// get all requests
export async function fetchRequests(kw: string, page: number, perPage: number) {
  var isStart = true;
  var url = 'requests';
  if (kw) {
    url += isStart ? '?' : '&';
    url += 'kw=' + kw;
    isStart = false;
  }

  url += isStart ? '?' : '&';
  url += `page=${page}&per_page=${perPage}`;

  const response = await api.get(url);
  const result = await handleResponse<PaginatedRequestListValues>(
    response,
    __('Failed to fetch requests', 'yay-wholesale'),
  );
  return result.data ?? {};
}

// get request by id
export async function fetchRequest(requestId: number) {
  const response = await api.get(`requests/${requestId}`);
  const result = await handleResponse<RequestFormValues>(
    response,
    __('Failed to fetch request', 'yay-wholesale'),
  );
  return result.data;
}

// update request
export async function updateRequest(data: RequestFormValues, requestId: number) {
  const response = await api.put(`requests/${requestId}`, { json: data });
  const result = await handleResponse<RequestFormValues>(
    response,
    __('Failed to update request', 'yay-wholesale'),
  );
  return result;
}

export async function deleteRequest(requestId: number) {
  const response = await api.delete(`requests/${requestId}`);
  const result = await handleResponse<RequestFormValues>(
    response,
    __('Failed to delete request', 'yay-wholesale'),
  );
  return result;
}
