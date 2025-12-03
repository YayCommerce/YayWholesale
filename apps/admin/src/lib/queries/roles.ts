import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';

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
import { showToast } from '@/components/custom/showToast';

import { RoleFormValues } from '../schema/roles';

const QUERY_KEY = ['roles'];

function rolesOptions() {
  return queryOptions({
    queryKey: ['roles'],
    queryFn: () => fetchRoles(),
    staleTime: 15 * 60 * 1000,
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
      showToast.success(response.message);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      navigate('/roles');
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}

// Mutation: update role
export function useUpdateRoleMutation(roleId: number) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: RoleFormValues) => updateRole(data, roleId),
    onSuccess: (response) => {
      showToast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['role', roleId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      navigate('/roles');
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}

// Mutation: delete role
export function useDeleteRoleMutation(roleId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteRole(roleId),
    onSuccess: (response) => {
      showToast.success(response.message);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}

// Mutation: delete many roles
export function useDeleteManyRolesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteManyRoles,
    onSuccess: (response) => {
      showToast.success(response.message);
      if (!queryClient.isFetching({ queryKey: QUERY_KEY })) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      }
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdateRoleStatusMutation(roleId: number) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (status: boolean) => updateRoleStatus(roleId, status),
    onSuccess: (response) => {
      showToast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['role', roleId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      navigate('/roles');
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}

export function useBulkUpdateRoleStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: boolean }) =>
      bulkUpdateRoleStatus(ids, status),
    onSuccess: (response) => {
      showToast.success(response.message);
      if (!queryClient.isFetching({ queryKey: QUERY_KEY })) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      }
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });
}
