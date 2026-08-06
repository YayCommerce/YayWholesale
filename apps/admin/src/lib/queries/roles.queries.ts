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
import { SETTINGS_QUERIES, useSettingsQuery } from './settings.queries';

/** ─── Query Options ─────────────────────────────────── */

export const ROLES_QUERIES = {
  all: queryOptions({
    queryKey: ['roles'],
    queryFn: async () => {
      const roles = await getAllRoles();
      window.yayWholesaleB2BAdmin.roles = roles;
      return roles;
    },
    initialData: () => window.yayWholesaleB2BAdmin.roles,
    staleTime: Infinity,
  }),
  userCountByRole: queryOptions({
    queryKey: ['user-count-by-role'],
    queryFn: () => countRolesUser(),
    staleTime: Infinity,
  }),
};

/** ─── Mutation Keys ─────────────────────────────────── */

const ROLES_MUTATION_KEYS = {
  add: ['roles', 'add'] as const,
  update: (slug: string) => ['roles', slug, 'update'] as const,
  updateStatus: (slug: string) => ['roles', slug, 'update-status'] as const,
  delete: (slug: string) => ['roles', slug, 'delete'] as const,
  bulkDelete: ['roles', 'bulk', 'delete'] as const,
  bulkUpdateStatus: ['roles', 'bulk', 'update-status'] as const,
  // prefix keys for useIsMutating
  allRoles: ['roles'] as const,
  role: (slug: string) => ['roles', slug] as const,
  allBulk: ['roles', 'bulk'] as const,
};

/** ─── Query Hooks ───────────────────────────────────── */

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

/** ─── Mutation Hooks ────────────────────────────────── */

export function useAddRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ROLES_MUTATION_KEYS.add,
    mutationFn: addRole,
    onSuccess: (res) => {
      queryClient.setQueryData(ROLES_QUERIES.all.queryKey, res.roles);
      queryClient.setQueryData(SETTINGS_QUERIES.main.queryKey, res.settings);
      window.yayWholesaleB2BAdmin.settings = res.settings;
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.all.queryKey }),
  });
}

export function useUpdateRoleMutation(roleSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ROLES_MUTATION_KEYS.update(roleSlug),
    mutationFn: (data: RoleFormValues) => updateRole(roleSlug, data),
    onSuccess: (res) => {
      queryClient.setQueryData(ROLES_QUERIES.all.queryKey, res.roles);
      queryClient.setQueryData(SETTINGS_QUERIES.main.queryKey, res.settings);
      window.yayWholesaleB2BAdmin.settings = res.settings;
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.all.queryKey }),
  });
}

export function useUpdateRoleStatusMutation(roleSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ROLES_MUTATION_KEYS.updateStatus(roleSlug),
    mutationFn: (status: boolean) => updateRoleStatus(roleSlug, status),

    onMutate: (status) => {
      const previous = queryClient.getQueryData(ROLES_QUERIES.all.queryKey);
      if (!previous) return;

      const next = previous.map((role) => (role.slug === roleSlug ? { ...role, status } : role));
      window.yayWholesaleB2BAdmin.roles = next;
      queryClient.setQueryData(ROLES_QUERIES.all.queryKey, next); // Optimistic

      return { previous };
    },

    onSuccess: (res) => {
      queryClient.setQueryData(ROLES_QUERIES.all.queryKey, res.roles);
      queryClient.setQueryData(SETTINGS_QUERIES.main.queryKey, res.settings);
      window.yayWholesaleB2BAdmin.settings = res.settings;
    },
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
    mutationKey: ROLES_MUTATION_KEYS.delete(roleSlug),
    mutationFn: () => deleteRole(roleSlug),
    onSuccess: (res) => {
      queryClient.setQueryData(ROLES_QUERIES.all.queryKey, res.roles);
      queryClient.setQueryData(SETTINGS_QUERIES.main.queryKey, res.settings);
      window.yayWholesaleB2BAdmin.settings = res.settings;
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.all.queryKey }),
  });
}

export function useBulkDeleteRolesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ROLES_MUTATION_KEYS.bulkDelete,
    mutationFn: bulkDeleteRoles,
    onSuccess: (res) => {
      queryClient.setQueryData(ROLES_QUERIES.all.queryKey, res.roles);
      queryClient.setQueryData(SETTINGS_QUERIES.main.queryKey, res.settings);
      window.yayWholesaleB2BAdmin.settings = res.settings;
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.all.queryKey }),
  });
}

export function useBulkUpdateRoleStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ROLES_MUTATION_KEYS.bulkUpdateStatus,
    mutationFn: ({ roleSlugs, status }: { roleSlugs: string[]; status: boolean }) =>
      bulkUpdateRoleStatus(roleSlugs, status),
    onSuccess: (res) => queryClient.setQueryData(ROLES_QUERIES.all.queryKey, res),
    onError: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERIES.all.queryKey }),
  });
}

/** ─── Mutation State ────────────────────────────────── */

export function useIsMutatingRoles() {
  return useIsMutating({ mutationKey: ROLES_MUTATION_KEYS.allRoles });
}

export function useIsMutatingRole(roleSlug: string) {
  return useIsMutating({ mutationKey: ROLES_MUTATION_KEYS.role(roleSlug) });
}

export function useIsMutatingRolesBulk() {
  return useIsMutating({ mutationKey: ROLES_MUTATION_KEYS.allBulk });
}

/** ─── Derived Hooks ─────────────────────────────────── */

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
