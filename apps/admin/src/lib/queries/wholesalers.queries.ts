import {
  keepPreviousData,
  queryOptions,
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { PaginatedResponse } from '@/lib/api/api.type';
import { bulkUpdateWholesalerRole, getWholesalers, updateWholesalerRole } from '@/lib/api/wholesalers.api';
import { Wholesaler, WholesalerFilter } from '@/lib/schema/wholesalers.type';
import { ROLES_QUERIES } from './roles.queries';

/** Options */

export const WHOLESALERS_QUERIES = {
  all: ['wholesalers'],
  list: (filter: WholesalerFilter) =>
    queryOptions({
      queryKey: ['wholesalers', filter],
      queryFn: () => getWholesalers(filter),
      placeholderData: keepPreviousData,
    }),
};

/** Queries */

export function useWholesalersQuery(filter: WholesalerFilter) {
  return useQuery(WHOLESALERS_QUERIES.list(filter));
}

/** Mutations */

export function useUpdateWholesalersRoleMutation(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['wholesalers', userId, 'update-role'],
    mutationFn: (roleSlug: string) => updateWholesalerRole(userId, roleSlug),
    onMutate: (roleSlug) => {
      queryClient
        .getQueryCache()
        .findAll({ queryKey: WHOLESALERS_QUERIES.all })
        .forEach((query) => {
          const previous = query.state.data as PaginatedResponse<Wholesaler>;
          query.setData({
            ...previous,
            data: previous.data.map((item) => (item.id === userId ? { ...item, wholesaleRoleSlug: roleSlug } : item)),
          }); // Optimistic
        });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.userCountByRole.queryKey }),
    onError: () => queryClient.invalidateQueries({ queryKey: WHOLESALERS_QUERIES.all }),
  });
}

export function useBulkUpdateWholesalersRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['wholesalers', 'bulk-update-roles'],
    mutationFn: ({ userIds, roleSlug }: { userIds: number[]; roleSlug: string }) =>
      bulkUpdateWholesalerRole(userIds, roleSlug),
    onMutate: ({ userIds, roleSlug }) => {
      queryClient
        .getQueryCache()
        .findAll({ queryKey: WHOLESALERS_QUERIES.all })
        .forEach((query) => {
          const previous = query.state.data as PaginatedResponse<Wholesaler>;
          query.setData({
            ...previous,
            data: previous.data.map((item) =>
              userIds.includes(item.id) ? { ...item, wholesaleRoleSlug: roleSlug } : item,
            ),
          }); // Optimistic
        });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.userCountByRole.queryKey }),
    onError: () => queryClient.invalidateQueries({ queryKey: WHOLESALERS_QUERIES.all }),
  });
}

/** Utils */

export function useIsMutatingWholesalers() {
  return useIsMutating({ mutationKey: ['wholesalers'] });
}
