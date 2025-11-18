import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { showToast } from '@/components/custom/showToast';

import {
  deleteRequestById,
  fetchRequestById,
  fetchRequests,
  updateRequestById,
  updateRequestStatusById,
} from '../api/requests.api';
import { RequestFormValues } from '../schema/requests';

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
      showToast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      if (!queryClient.isFetching({ queryKey: ['requests'] })) {
        queryClient.invalidateQueries({ queryKey: ['requests'] });
      }
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}

export function useDeleteRequestMutation(requestId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['request', requestId, 'delete'],
    mutationFn: () => deleteRequestById(requestId),
    onSuccess: (response) => {
      showToast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      if (!queryClient.isFetching({ queryKey: ['requests'] })) {
        queryClient.invalidateQueries({ queryKey: ['requests'] });
      }
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdateRequestStatusMutation(requestId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['request', requestId, 'update-status'],
    mutationFn: ({ status, roleId }: { status: RequestFormValues['status']; roleId: number }) =>
      updateRequestStatusById(requestId, status, roleId),
    onSuccess: (response) => {
      showToast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      if (!queryClient.isFetching({ queryKey: ['requests'] })) {
        queryClient.invalidateQueries({ queryKey: ['requests'] });
      }
      if (!queryClient.isFetching({ queryKey: ['roles'] })) {
        queryClient.invalidateQueries({ queryKey: ['roles'] });
      }
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}
