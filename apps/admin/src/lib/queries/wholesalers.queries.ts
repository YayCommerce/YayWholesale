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

/** ─── Query Options ─────────────────────────────────── */

export const WHOLESALERS_QUERIES = {
  all: ['wholesalers'] as const,
  list: (filter: WholesalerFilter) =>
    queryOptions({
      queryKey: ['wholesalers', filter],
      queryFn: () => getWholesalers(filter),
      placeholderData: keepPreviousData,
    }),
};

/** ─── Mutation Keys ─────────────────────────────────── */

const WHOLESALERS_MUTATION_KEYS = {
  updateRole:     (id: number) => ['wholesalers', id, 'update-role'] as const,
  bulkUpdateRole: ['wholesalers', 'bulk-update-roles']               as const,
  // prefix keys for useIsMutating
  allWholesalers: ['wholesalers']                                    as const,
};

/** ─── Query Hooks ───────────────────────────────────── */

export function useWholesalersQuery(filter: WholesalerFilter) {
  return useQuery(WHOLESALERS_QUERIES.list(filter));
}

/** ─── Mutation Hooks ────────────────────────────────── */

export function useUpdateWholesalersRoleMutation(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: WHOLESALERS_MUTATION_KEYS.updateRole(userId),
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
    mutationKey: WHOLESALERS_MUTATION_KEYS.bulkUpdateRole,
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

/** ─── Mutation State ────────────────────────────────── */

export function useIsMutatingWholesalers() {
  return useIsMutating({ mutationKey: WHOLESALERS_MUTATION_KEYS.allWholesalers });
}
