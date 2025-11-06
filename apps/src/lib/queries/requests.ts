import { useQuery } from '@tanstack/react-query';

import { fetchRequests } from '../api/requests.api';

const QUERY_KEY = ['requests'];

// Query all request
export function useRequestsQuery(kw: string, page: number, perPage: number) {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetchRequests(kw, page, perPage),
    refetchOnMount: 'always',
  });
}
