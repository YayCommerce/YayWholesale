import {
  keepPreviousData,
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
import { WHOLESALERS_QUERIES } from '@/lib/queries/wholesalers.queries';
import { Request, RequestFilter } from '@/lib/schema/requests.type';
import { ROLES_QUERIES } from './roles.queries';

/** ─── Query Options ─────────────────────────────────── */

const REQUESTS_QUERIES = {
  all: ['requests'] as const,
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

/** ─── Mutation Keys ─────────────────────────────────── */

const REQUESTS_MUTATION_KEYS = {
  approve:     (id: number) => ['requests', id, 'approve'] as const,
  reject:      (id: number) => ['requests', id, 'reject']  as const,
  delete:      (id: number) => ['requests', id, 'delete']  as const,
  bulkApprove: ['requests', 'bulk', 'approve']             as const,
  bulkReject:  ['requests', 'bulk', 'reject']              as const,
  bulkDelete:  ['requests', 'bulk', 'delete']              as const,
  // prefix keys for useIsMutating
  allRequests: ['requests']                                as const,
  request:     (id: number) => ['requests', id]            as const,
  allBulk:     ['requests', 'bulk']                        as const,
};

/** ─── Query Hooks ───────────────────────────────────── */

export function useRequestsQuery(filter: RequestFilter) {
  return useQuery(REQUESTS_QUERIES.list(filter));
}

export function useSingleRequestQuery(requestId: number) {
  return useQuery(REQUESTS_QUERIES.single(requestId));
}

export function useCountByStatusQuery() {
  return useQuery(REQUESTS_QUERIES.countByStatus);
}

/** ─── Mutation Hooks ────────────────────────────────── */

export function useApproveRequestMutation(requestId: number) {
  const queryClient = useQueryClient();
  const { cacheRequest } = useCacheRequest();
  return useMutation({
    mutationKey: REQUESTS_MUTATION_KEYS.approve(requestId),
    mutationFn: (roleSlug: string) => approveRequest(requestId, roleSlug),
    onSuccess: (updatedRequest) => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all });
      queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.userCountByRole.queryKey });
      queryClient.invalidateQueries({ queryKey: WHOLESALERS_QUERIES.all });
      cacheRequest(updatedRequest);
    },
    onError: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
  });
}

export function useBulkApproveRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: REQUESTS_MUTATION_KEYS.bulkApprove,
    mutationFn: ({ requestIds, roleSlug }: { requestIds: number[]; roleSlug: string }) =>
      bulkApproveRequest(requestIds, roleSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all });
      queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.userCountByRole.queryKey });
      queryClient.invalidateQueries({ queryKey: WHOLESALERS_QUERIES.all });
    },
    onError: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
  });
}

export function useRejectRequestMutation(requestId: number) {
  const queryClient = useQueryClient();
  const { cacheRequest } = useCacheRequest();
  return useMutation({
    mutationKey: REQUESTS_MUTATION_KEYS.reject(requestId),
    mutationFn: () => rejectRequest(requestId),
    onSuccess: (updatedRequest) => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all });
      cacheRequest(updatedRequest);
    },
    onError: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
  });
}

export function useBulkRejectRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: REQUESTS_MUTATION_KEYS.bulkReject,
    mutationFn: bulkRejectRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
    onError: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
  });
}

export function useDeleteRequestMutation(requestId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: REQUESTS_MUTATION_KEYS.delete(requestId),
    mutationFn: () => deleteRequest(requestId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
    onError: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
  });
}

export function useBulkDeleteRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: REQUESTS_MUTATION_KEYS.bulkDelete,
    mutationFn: bulkDeleteRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
    onError: () => queryClient.invalidateQueries({ queryKey: REQUESTS_QUERIES.all }),
  });
}

/** ─── Mutation State ────────────────────────────────── */

export function useIsMutatingRequests() {
  return useIsMutating({ mutationKey: REQUESTS_MUTATION_KEYS.allRequests }) > 0;
}

export function useIsMutatingRequestsBulk() {
  return useIsMutating({ mutationKey: REQUESTS_MUTATION_KEYS.allBulk }) > 0;
}

export function useIsMutatingRequest(requestId: number) {
  return useIsMutating({ mutationKey: REQUESTS_MUTATION_KEYS.request(requestId) }) > 0;
}

/** ─── Derived Hooks ─────────────────────────────────── */

export function useCacheRequest() {
  const queryClient = useQueryClient();

  function cacheRequest(request: Request) {
    queryClient.setQueryData(REQUESTS_QUERIES.single(request.id).queryKey, request);
  }

  return { cacheRequest };
}
