import { __ } from '@wordpress/i18n';

import { RequestListValues } from '../schema/requests';
import { api, handleResponse } from './base';

// get all requests
export async function fetchRequests(kw: string) {
  var isStart = false;
  var url = 'requests';
  if (kw) {
    url += !isStart ? '?' : '&';
    url += 'kw=' + kw;
  }
  const response = await api.get(url);
  const result = await handleResponse<RequestListValues[]>(
    response,
    __('Failed to fetch requests'),
  );
  return result.data ?? [];
}
