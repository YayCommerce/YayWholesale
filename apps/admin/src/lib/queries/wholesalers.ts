import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/custom/showToast';
import {
  bulkUpdateWholesalerRole,
  fetchWholesalersList,
  getTotalCountWholesalers,
  updateWholesalerRole,
} from '../api/wholesalers';
import { handleErrorMessage } from '../utils';

export function useWholesalersQuery(
  search: string,
  pagination: {
    pageIndex: number;
    pageSize: number;
  },
  role: string,
) {
  return useQuery({
    queryKey: ['wholesalers', { search, pagination, role }],
    queryFn: async () => {
      return fetchWholesalersList(search, pagination.pageIndex + 1, pagination.pageSize, role);
    },
    placeholderData: keepPreviousData,
  });
}

export function useUpdateWholesalersRoleMutation(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['wholesalers', userId, 'update-role'],
    mutationFn: ({ roleSlug }: { roleSlug: string }) => updateWholesalerRole(userId, roleSlug),
    onSuccess: (response) => {
      showToast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['wholesalers', userId] });
      if (!queryClient.isFetching({ queryKey: ['wholesalers'] })) {
        queryClient.invalidateQueries({ queryKey: ['wholesalers'] });
      }
    },
    onError: handleErrorMessage,
  });
}

export function useBulkUpdateWholesalersRoleMutation(userIds: number[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['wholesalers', 'bulk-update-roles'],
    mutationFn: ({ roleSlug }: { roleSlug: string }) => bulkUpdateWholesalerRole(userIds, roleSlug),
    onSuccess: (response) => {
      showToast.success(response.message);
      if (!queryClient.isFetching({ queryKey: ['wholesalers'] })) {
        queryClient.invalidateQueries({ queryKey: ['wholesalers'] });
      }
    },
    onError: handleErrorMessage,
  });
}

export function useTotalCountQuery() {
  return useQuery({
    queryKey: ['wholesalers', 'total-count'],
    queryFn: () => getTotalCountWholesalers(),
  });
}
