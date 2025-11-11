import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { showToast } from '@/components/custom/showToast';

import { deleteRequest, fetchRequest, fetchRequests, updateRequest } from '../api/requests.api';
import { RequestFormValues } from '../schema/requests';

const QUERY_KEY = ['requests'];

// Query all request
export function useRequestsQuery(kw: string, page: number, perPage: number) {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => fetchRequests(kw, page, perPage),
    refetchOnMount: 'always',
  });
}

// Query request
export function useRequestQuery(requestId: number | null) {
  return useQuery({
    queryKey: ['request', requestId],
    queryFn: async () => {
      if (!requestId) {
        throw new Error('No Request ID provided');
      }
      const response = await fetchRequest(requestId);
      return response;
    },
    enabled: !!requestId,
  });
}

// Mutation: update request
export function useUpdateRequestMutation(requestId: number) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: RequestFormValues) => updateRequest(data, requestId),
    onSuccess: (response) => {
      showToast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      navigate('/request');
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}

//Mutation: delete request
export function useDeleteRequestMutation(requestId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteRequest(requestId),
    onSuccess: (response) => {
      showToast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}
