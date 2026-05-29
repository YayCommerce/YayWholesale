import { useQuery } from '@tanstack/react-query';

import { fetchAllPages } from '@/lib/api/pages.api';

export function usePagesQuery() {
  return useQuery({
    queryKey: ['pages'],
    queryFn: fetchAllPages,
    staleTime: Infinity,
  });
}
