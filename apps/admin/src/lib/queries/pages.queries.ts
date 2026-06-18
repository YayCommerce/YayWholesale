import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { getPages } from '@/lib/api/pages.api';

export function useAllPagesQuery() {
  const queries = useInfiniteQuery({
    queryKey: ['pages'],
    queryFn: ({ pageParam = 1 }) => getPages(pageParam, 100),
    getNextPageParam: (lastPage, pages) => (lastPage.totalPages > pages.length ? pages.length + 1 : undefined),
    initialPageParam: 1,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (queries.hasNextPage && !queries.isFetchingNextPage) {
      queries.fetchNextPage();
    }
  }, [queries.hasNextPage, queries.isFetchingNextPage]);

  return queries;
}
