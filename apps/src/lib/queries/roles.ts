import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';

import {
  deleteManyRoles,
  deleteRole,
  fetchRole,
  fetchRoles,
  postRole,
  updateRole,
} from '@/lib/api/roles.api';
import { showToast } from '@/components/custom/showToast';

import { RoleFormValues } from '../schema/roles';

const QUERY_KEY = ['roles'];

// Query all roles
export function useRolesQuery() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchRoles,
  });
}

/**
 * Query to fetch Role by ID
 * @param roleId - ID of the Role
 * @returns Query to fetch Role data
 */
export function useRoleQuery(roleId: string | null) {
  console.log('roleId', roleId);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast.success(__('Role created successfully!'));
      navigate('/roles');
    },
    onError: (error: Error) => {
      showToast.error(__(`Failed to add role: ${error.message}`));
    },
  });
}

// Mutation: update role
export function useUpdateRoleMutation(roleId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: RoleFormValues) => updateRole(data, roleId),
    onSuccess: () => {
      showToast.success(__('Role updated successfully!'));
      queryClient.invalidateQueries({ queryKey: ['role', roleId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      navigate('/roles');
    },
    onError: (error: Error) => {
      showToast.error(__(`Failed to update role: ${error.message}`));
    },
  });
}

// Mutation: delete role
export function useDeleteRoleMutation(roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteRole(roleId),
    onSuccess: () => {
      showToast.success(__('Role deleted successfully!'));
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error: Error) => {
      showToast.error(__(`Failed to delete role: ${error.message}`));
    },
  });
}

// Mutation: delete many roles
export function useDeleteManyRolesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteManyRoles,
    onSuccess: () => {
      showToast.success(__('Selected roles deleted!'));
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error: Error) => {
      showToast.error(__(`Failed to delete selected roles: ${error.message}`));
    },
  });
}
