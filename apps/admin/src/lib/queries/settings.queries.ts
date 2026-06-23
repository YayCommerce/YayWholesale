import { queryOptions, useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getSettings, postSettings, saveSetup, skipSetup, updateEmailStatus } from '@/lib/api/settings.api';
import { ROLES_QUERIES } from '@/lib/queries/roles.queries';
import type { Settings } from '@/lib/schema/settings.schema';
import { SetupWizardForm } from '@/lib/schema/wizard.schema';

/** Options */

export const SETTINGS_QUERIES = {
  main: queryOptions({
    queryKey: ['settings', 'main'],
    queryFn: async () => {
      const settings = await getSettings();
      window.yayWholesaleB2BAdmin.settings = settings;
      return settings;
    },
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

export function useSaveSettingsMutation() {
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
      const previous = queryClient.getQueryData(SETTINGS_QUERIES.emails.queryKey);
      if (!previous) return;

      const next = previous.map((e) => (e.id === emailId ? { ...e, status } : e));
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

export function useSaveSetupWizardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['settings', 'setup-wizard'],
    mutationFn: async (setupWizardForm: SetupWizardForm) => saveSetup(setupWizardForm),
    onSuccess: (res) => {
      window.yayWholesaleB2BAdmin.settings = res.settings;
      queryClient.setQueryData(SETTINGS_QUERIES.main.queryKey, res.settings);
      queryClient.setQueryData(ROLES_QUERIES.all.queryKey, res.roles);
    },
    onError: () => queryClient.invalidateQueries({ queryKey: SETTINGS_QUERIES.main.queryKey }),
  });
}

export function useSkipSetupWizardMutation() {
  return useMutation({
    mutationKey: ['settings', 'setup-wizard', 'skip'],
    mutationFn: async () => skipSetup(),
  });
}

/** Utils */

export function useIsMutatingSettings() {
  return useIsMutating({ mutationKey: ['settings', 'main'] });
}

export function useIsMutatingSetup() {
  return useIsMutating({ mutationKey: ['settings', 'setup-wizard'] });
}
