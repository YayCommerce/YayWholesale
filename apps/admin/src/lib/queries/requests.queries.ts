import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/components/ui/sonner';
import {
  bulkDeleteRequest,
  bulkUpdateRequestStatus,
  deleteRequestById,
  fetchRequestById,
  fetchRequests,
  getPendingCount,
  getTotalCount,
  updateRequestById,
  updateRequestStatusById,
} from '../api/requests.api';
import { RequestFormValues } from '../schema/requests.type';
import { handleErrorMessage } from '../utils';

export function useRequestsQuery(
  keyword: string,
  pagination: {
    pageIndex: number;
    pageSize: number;
  },
  status: string,
) {
  return useQuery({
    queryKey: ['requests', { keyword, pagination, status }],
    queryFn: async () => {
      return fetchRequests(keyword, pagination.pageIndex + 1, pagination.pageSize, status);
    },
    placeholderData: keepPreviousData,
  });
}

export function useRequestQuery(requestId: number | null) {
  return useQuery({
    queryKey: ['request', requestId],
    queryFn: async () => {
      if (!requestId) {
        throw new Error('No Request ID provided');
      }
      const response = await fetchRequestById(requestId);
      return response;
    },
    enabled: !!requestId,
  });
}

export function useUpdateRequestMutation(requestId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['request', requestId, 'update'],
    mutationFn: (data: RequestFormValues) => updateRequestById(data, requestId),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: handleErrorMessage,
  });
}

export function useDeleteRequestMutation(requestId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['request', requestId, 'delete'],
    mutationFn: () => deleteRequestById(requestId),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: handleErrorMessage,
  });
}

export function useUpdateRequestStatusMutation(requestId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['request', requestId, 'update-status'],
    mutationFn: ({ status, roleId }: { status: RequestFormValues['status']; roleId: number }) =>
      updateRequestStatusById(requestId, status, roleId),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['wholesalers'] });
    },
    onError: handleErrorMessage,
  });
}

export function useBulkUpdateRequestStatusMutation(ids: number[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['requests', 'bulk-update-status'],
    mutationFn: ({ status, roleId }: { status: RequestFormValues['status']; roleId: number }) =>
      bulkUpdateRequestStatus(ids, status, roleId),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['wholesalers'] });
    },
    onError: handleErrorMessage,
  });
}

export function useBulkDeleteRequestMutation(ids: number[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['requests', 'bulk-delete'],
    mutationFn: () => bulkDeleteRequest(ids),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: handleErrorMessage,
  });
}

export function usePendingCountQuery() {
  return useQuery({
    queryKey: ['requests', 'pending-count'],
    queryFn: () => getPendingCount(),
  });
}

export function useTotalCountQuery() {
  return useQuery({
    queryKey: ['requests', 'total-count'],
    queryFn: () => getTotalCount(),
  });
}
