import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

import {
  bulkUpdateRoleStatus,
  deleteManyRoles,
  deleteRole,
  fetchActiveRoles,
  fetchRole,
  fetchRoles,
  postRole,
  updateRole,
  updateRoleStatus,
} from '@/lib/api/roles.api';
import { toast } from '@/components/ui/sonner';
import { RoleFormValues } from '../schema/roles.legacy';
import { getRoles, handleErrorMessage } from '../utils';

const QUERY_KEY = ['roles'];

function rolesOptions() {
  return queryOptions({
    queryKey: ['roles'],
    queryFn: () => fetchRoles(),
    staleTime: 15 * 60 * 1000,
    placeholderData: (previousData) => previousData ?? getRoles(),
  });
}

// Query all roles
export function useRolesQuery() {
  return useQuery(rolesOptions());
}

export function useActiveRolesQuery() {
  return useQuery({
    queryKey: ['roles', { active: true }],
    queryFn: () => fetchActiveRoles(),
    placeholderData: (previousData) => previousData ?? getRoles().filter((role) => role.status),
  });
}

/**
 * Query to fetch Role by ID
 * @param roleId - ID of the Role
 * @returns Query to fetch Role data
 */
export function useRoleQuery(roleId: number | null) {
  return useQuery({
    queryKey: ['role', roleId],
    queryFn: async () => {
      if (!roleId) {
        throw new Error('No role ID provided');
      }
      const response = await fetchRole(roleId);
      return response;
    },
    enabled: !!roleId,
  });
}

// Mutation: create new role
export function useAddRoleMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: postRole,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      navigate('/roles');
    },
    onError: handleErrorMessage,
  });
}

// Mutation: update role
export function useUpdateRoleMutation(roleId: number) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: RoleFormValues) => updateRole(data, roleId),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['role', roleId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      navigate('/roles');
    },
    onError: handleErrorMessage,
  });
}

// Mutation: delete role
export function useDeleteRoleMutation(roleId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteRole(roleId),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: handleErrorMessage,
  });
}

// Mutation: delete many roles
export function useDeleteManyRolesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteManyRoles,
    onSuccess: (response) => {
      toast.success(response.message);
      if (!queryClient.isFetching({ queryKey: QUERY_KEY })) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      }
    },
    onError: handleErrorMessage,
  });
}

export function useUpdateRoleStatusMutation(roleId: number) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (status: boolean) => updateRoleStatus(roleId, status),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['role', roleId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['wholesalers'] });
      navigate('/roles');
    },
    onError: handleErrorMessage,
  });
}

export function useBulkUpdateRoleStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: boolean }) => bulkUpdateRoleStatus(ids, status),
    onSuccess: (response) => {
      toast.success(response.message);
      if (!queryClient.isFetching({ queryKey: QUERY_KEY })) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      }
      queryClient.invalidateQueries({ queryKey: ['wholesalers'] });
    },
    onError: handleErrorMessage,
  });
}
