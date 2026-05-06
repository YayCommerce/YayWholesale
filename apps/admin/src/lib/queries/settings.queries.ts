import { queryOptions, useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getSettings, postSettings, updateEmailStatus } from '@/lib/api/settings.api';
import type { Settings } from '@/lib/schema/settings.schema';

/** Options */

const SETTINGS_QUERIES = {
  main: queryOptions({
    queryKey: ['settings', 'main'],
    queryFn: () => getSettings(),
    initialData: window.yayWholesaleB2BAdmin.settings,
    staleTime: Infinity,
  }),
  emails: queryOptions({
    queryKey: ['settings', 'emails'],
    queryFn: () => window.yayWholesaleB2BAdmin.wholesale_emails,
    initialData: window.yayWholesaleB2BAdmin.wholesale_emails,
    staleTime: Infinity,
  }),
};

/** Queries */

export function useSettingsQuery() {
  return useQuery(SETTINGS_QUERIES.main);
}

export function useSettingsEmailsQuery() {
  return useQuery(SETTINGS_QUERIES.emails);
}

/** Mutations */

export function useSaveMainSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['settings', 'main'],
    mutationFn: async (data: Settings) => postSettings(data),
    onSuccess: (res) => {
      window.yayWholesaleB2BAdmin.settings = res;
      queryClient.setQueryData(SETTINGS_QUERIES.main.queryKey, res);
    },
    onError: () => queryClient.invalidateQueries({ queryKey: SETTINGS_QUERIES.main.queryKey }),
  });
}

export function useUpdateEmailStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['settings', 'emails', 'update-status'],
    mutationFn: async ({ emailId, status }: { emailId: string; status: boolean }) => updateEmailStatus(emailId, status),

    onMutate: async ({ emailId, status }) => {
      const previous = window.yayWholesaleB2BAdmin.wholesale_emails;
      const next = previous!.map((e) => (e.id === emailId ? { ...e, status } : e));

      window.yayWholesaleB2BAdmin.wholesale_emails = next;
      queryClient.setQueryData(SETTINGS_QUERIES.emails.queryKey, next); // Optimistic

      return { previous };
    },

    onError: (_err, _, context) => {
      if (context?.previous) {
        window.yayWholesaleB2BAdmin.wholesale_emails = context.previous;
        queryClient.setQueryData(SETTINGS_QUERIES.emails.queryKey, context.previous); // Rollback
      }
    },
  });
}

/** Utils */

export function useIsMutatingMainSettings() {
  return useIsMutating({ mutationKey: ['settings', 'main'] });
}

export function useIsMutatingEmailsSettings() {
  return useIsMutating({ mutationKey: ['settings', 'emails'] });
}
