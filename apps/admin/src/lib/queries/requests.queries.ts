import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  approveRequest,
  bulkApproveRequest,
  bulkDeleteRequest,
  bulkRejectRequest,
  countRequestByStatus,
  deleteRequest,
  getRequestById,
  getRequests,
  rejectRequest,
} from '@/lib/api/requests.api';
import { Request, RequestFilter } from '@/lib/schema/requests.type';
import { ROLES_QUERIES } from './roles.queries';

/** Options */

const REQUESTS_QUERIES = {
  all: ['requests'],
  list: (filter: RequestFilter) =>
    queryOptions({
      queryKey: ['requests', filter],
      queryFn: () => getRequests(filter),
      placeholderData: keepPreviousData,
    }),
  single: (requestId: number) =>
    queryOptions({
      queryKey: ['requests', requestId],
      queryFn: () => getRequestById(requestId),
      enabled: requestId > 0,
    }),
  countByStatus: queryOptions({
    queryKey: ['requests', 'count-by-status'],
    queryFn: () => countRequestByStatus(),
    staleTime: Infinity,
  }),
};

/** Queries */

export function useRequestsQuery(filter: RequestFilter) {
  return useQuery(REQUESTS_QUERIES.list(filter));
}

export function useSingleRequestQuery(requestId: number) {
  return useQuery(REQUESTS_QUERIES.single(requestId));
}

export function useCountByStatusQuery() {
  return useQuery(REQUESTS_QUERIES.countByStatus);
}

/** Mutations */

export function useApproveRequestMutation(requestId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['requests', requestId, 'approve'],
    mutationFn: (roleSlug: string) => approveRequest(requestId, roleSlug),
    onSuccess: (updatedRequest) => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all });
      queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.userCountByRole.queryKey });
      cacheRequest(queryClient, updatedRequest);
    },
    onError: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
  });
}

export function useBulkApproveRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['requests', 'bulk', 'approve'],
    mutationFn: ({ requestIds, roleSlug }: { requestIds: number[]; roleSlug: string }) =>
      bulkApproveRequest(requestIds, roleSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all });
      queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.userCountByRole.queryKey });
    },
    onError: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
  });
}

export function useRejectRequestMutation(requestId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['requests', requestId, 'reject'],
    mutationFn: () => rejectRequest(requestId),
    onSuccess: (updatedRequest) => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all });
      cacheRequest(queryClient, updatedRequest);
    },
    onError: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
  });
}

export function useBulkRejectRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['requests', 'bulk', 'reject'],
    mutationFn: bulkRejectRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
    onError: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
  });
}

export function useDeleteRequestMutation(requestId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['requests', requestId, 'delete'],
    mutationFn: () => deleteRequest(requestId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
    onError: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
  });
}

export function useBulkDeleteRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['requests', 'bulk', 'delete'],
    mutationFn: bulkDeleteRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
    onError: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
  });
}

/** Utils */

export function useIsMutatingRequests() {
  return useIsMutating({ mutationKey: ['requests'] });
}

export function useIsMutatingRequest(requestId: number) {
  const isMutatingBulk = useIsMutating({ mutationKey: ['requests', 'bulk'] });
  const isMutatingSingle = useIsMutating({ mutationKey: ['requests', requestId] });
  return isMutatingBulk + isMutatingSingle;
}

export function cacheRequest(queryClient: QueryClient, request: Request) {
  queryClient.setQueryData(REQUESTS_QUERIES.single(request.id).queryKey, request);
}
