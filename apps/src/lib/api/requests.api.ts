import { __ } from '@wordpress/i18n';

import { PaginatedRequestListValues } from '../schema/requests';
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
    __('Failed to fetch requests'),
  );
  return result.data ?? {};
}
