import { queryOptions, useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';

import {
  addRole,
  bulkDeleteRoles,
  bulkUpdateRoleStatus,
  countRolesUser,
  deleteRole,
  getAllRoles,
  updateRole,
  updateRoleStatus,
} from '@/lib/api/roles.api';
import { Role, RoleFormValues } from '@/lib/schema/roles.schema';

function rolesOptions() {
  return queryOptions({
    queryKey: ['roles'],
    queryFn: () => getAllRoles().then((res) => res.data),
    initialData: window.yayWholesaleB2BAdmin.roles,
  });
}

/** Queries */

export function useAllRolesQuery() {
  return useQuery(rolesOptions());
}

export function useActiveRolesQuery() {
  return useQuery({
    ...rolesOptions(),
    select: (data) => data.filter((role) => role.status),
  });
}

export function useRoleQuery(roleId: number) {
  return useQuery({
    ...rolesOptions(),
    select: (data) => data.find((role) => role.id === roleId) ?? null,
  });
}

export function useUserCountByRole() {
  return useQuery({
    queryKey: ['user-count-by-role'],
    queryFn: () => countRolesUser().then((res) => res.data),
  });
}

/** Mutations */

export function useAddRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['roles', 'add'],
    mutationFn: addRole,
    onSuccess: (res) => {
      queryClient.setQueryData(['roles'], res.data);
    },
  });
}

export function useUpdateRoleMutation(roleId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['roles', roleId, 'update'],
    mutationFn: (data: RoleFormValues) => updateRole(roleId, data),
    onSuccess: (res) => {
      queryClient.setQueryData(['roles'], res.data);
    },
  });
}

export function useUpdateRoleStatusMutation(roleId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['roles', roleId, 'update-status'],
    mutationFn: (status: boolean) => updateRoleStatus(roleId, status),

    // Optimistic update
    onMutate: (status) => {
      const previousData = queryClient.getQueryData<Role[]>(['roles']);

      queryClient.setQueryData<Role[]>(['roles'], (old) => {
        return old?.map((role) => {
          if (role.id === roleId) {
            return { ...role, status };
          }
          return role;
        });
      });

      return { previousData };
    },

    onError: (err, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['roles'], context.previousData);
      }
    },
    onSuccess: (res) => {
      queryClient.setQueryData(['roles'], res.data);
    },
  });
}

export function useDeleteRoleMutation(roleId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['roles', roleId, 'delete'],
    mutationFn: () => deleteRole(roleId),
    onSuccess: (res) => {
      queryClient.setQueryData(['roles'], res.data);
    },
  });
}

export function useBulkDeleteRolesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['roles', 'bulk-delete'],
    mutationFn: bulkDeleteRoles,
    onSuccess: (res) => {
      queryClient.setQueryData(['roles'], res.data);
    },
  });
}

export function useBulkUpdateRoleStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['roles', 'bulk-update-status'],
    mutationFn: ({ ids, status }: { ids: number[]; status: boolean }) => bulkUpdateRoleStatus(ids, status),
    onSuccess: (res) => {
      queryClient.setQueryData(['roles'], res.data);
    },
  });
}

/** Mutate Status */

export function useIsMutatingRoles() {
  return useIsMutating({ mutationKey: ['roles'] });
}

export function useIsMutatingRole(roleId: number) {
  return useIsMutating({ mutationKey: ['roles', roleId] });
}
