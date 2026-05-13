import { useMemo } from 'react';
import { queryOptions, useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
import { RoleFormValues } from '@/lib/schema/roles.schema';
import { useSettingsQuery } from './settings.queries';

/** Options */

export const ROLES_QUERIES = {
  all: queryOptions({
    queryKey: ['roles'],
    queryFn: async () => {
      const roles = await getAllRoles();
      window.yayWholesaleB2BAdmin.roles = roles;
      return roles;
    },
    initialData: window.yayWholesaleB2BAdmin.roles,
    staleTime: Infinity,
  }),
  userCountByRole: queryOptions({
    queryKey: ['user-count-by-role'],
    queryFn: () => countRolesUser(),
    staleTime: Infinity,
  }),
};

/** Queries */

export function useAllRolesQuery() {
  return useQuery(ROLES_QUERIES.all);
}

export function useActiveRolesQuery() {
  return useQuery({
    ...ROLES_QUERIES.all,
    select: (data) => data.filter((role) => role.status),
  });
}

export function useRoleQuery(roleSlug: string) {
  return useQuery({
    ...ROLES_QUERIES.all,
    select: (data) => data.find((role) => role.slug === roleSlug) ?? null,
  });
}

export function useUserCountByRolesQuery() {
  return useQuery(ROLES_QUERIES.userCountByRole);
}

export function useUserCountByRoleQuery(roleSlug: string) {
  return useQuery({
    ...ROLES_QUERIES.userCountByRole,
    select: (data) => data[roleSlug] ?? 0,
  });
}

/** Mutations */

export function useAddRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['roles', 'add'],
    mutationFn: addRole,
    onSuccess: (res) => queryClient.setQueryData(ROLES_QUERIES.all.queryKey, res),
    onError: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.all.queryKey }),
  });
}

export function useUpdateRoleMutation(roleSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['roles', roleSlug, 'update'],
    mutationFn: (data: RoleFormValues) => updateRole(roleSlug, data),
    onSuccess: (res) => queryClient.setQueryData(ROLES_QUERIES.all.queryKey, res),
    onError: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.all.queryKey }),
  });
}

export function useUpdateRoleStatusMutation(roleSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['roles', roleSlug, 'update-status'],
    mutationFn: (status: boolean) => updateRoleStatus(roleSlug, status),

    onMutate: (status) => {
      const previous = queryClient.getQueryData(ROLES_QUERIES.all.queryKey);
      if (!previous) return;

      const next = previous.map((role) => (role.slug === roleSlug ? { ...role, status } : role));
      window.yayWholesaleB2BAdmin.roles = next;
      queryClient.setQueryData(ROLES_QUERIES.all.queryKey, next); // Optimistic

      return { previous };
    },

    onSuccess: (res) => queryClient.setQueryData(ROLES_QUERIES.all.queryKey, res),
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        window.yayWholesaleB2BAdmin.roles = context.previous;
        queryClient.setQueryData(ROLES_QUERIES.all.queryKey, context.previous); // Rollback
      }
      queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.all.queryKey });
    },
  });
}

export function useDeleteRoleMutation(roleSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['roles', roleSlug, 'delete'],
    mutationFn: () => deleteRole(roleSlug),
    onSuccess: (res) => queryClient.setQueryData(ROLES_QUERIES.all.queryKey, res),
    onError: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.all.queryKey }),
  });
}

export function useBulkDeleteRolesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['roles', 'bulk-delete'],
    mutationFn: bulkDeleteRoles,
    onSuccess: (res) => queryClient.setQueryData(ROLES_QUERIES.all.queryKey, res),
    onError: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.all.queryKey }),
  });
}

export function useBulkUpdateRoleStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['roles', 'bulk-update-status'],
    mutationFn: ({ roleSlugs, status }: { roleSlugs: string[]; status: boolean }) =>
      bulkUpdateRoleStatus(roleSlugs, status),
    onSuccess: (res) => queryClient.setQueryData(ROLES_QUERIES.all.queryKey, res),
    onError: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.all.queryKey }),
  });
}

/** Mutate Status */

export function useIsMutatingRoles() {
  return useIsMutating({ mutationKey: ['roles'] });
}

export function useDefaultRole() {
  const { data: activeRoles } = useActiveRolesQuery();
  const { data: settings } = useSettingsQuery();

  return useMemo(() => {
    if (activeRoles.length === 0) return null;

    const defaultRoleSlug = settings.general.default_role;
    const defaultRole = activeRoles.find((role) => role.slug === defaultRoleSlug);
    if (!defaultRole) return activeRoles[0];

    return defaultRole;
  }, [settings, activeRoles]);
}
