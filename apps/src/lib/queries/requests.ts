import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { showToast } from '@/components/custom/showToast';

import {
  deleteRequestById,
  fetchRequestById,
  fetchRequests,
  updateRequestById,
} from '../api/requests.api';
import { RequestFormValues } from '../schema/requests';

export function useRequestsQuery(
  keyword: string,
  pagination: {
    pageIndex: number;
    pageSize: number;
  },
) {
  return useQuery({
    queryKey: ['requests', { keyword, pagination }],
    queryFn: async () => {
      return fetchRequests(keyword, pagination.pageIndex + 1, pagination.pageSize);
    },
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
  const navigate = useNavigate();
  return useMutation({
    mutationKey: ['updateRequest', requestId],
    mutationFn: (data: RequestFormValues) => updateRequestById(data, requestId),
    onSuccess: (response) => {
      showToast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      navigate('/request');
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}

export function useDeleteRequestMutation(requestId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['deleteRequest', requestId],
    mutationFn: () => deleteRequestById(requestId),
    onSuccess: (response) => {
      showToast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['request'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}
