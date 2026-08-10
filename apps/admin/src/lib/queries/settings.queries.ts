import { queryOptions, useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  exportPricingCsv,
  getSettings,
  importPricingCsv,
  postSettings,
  updateEmailStatus,
} from '@/lib/api/settings.api';
import type { Settings } from '@/lib/schema/settings.schema';

/** ─── Query Options ─────────────────────────────────── */

export const SETTINGS_QUERIES = {
  main: queryOptions({
    queryKey: ['settings', 'main'],
    queryFn: async () => {
      const settings = await getSettings();
      window.yayWholesaleB2BAdmin.settings = settings;
      return settings;
    },
    initialData: () => window.yayWholesaleB2BAdmin.settings,
    staleTime: Infinity,
  }),
  emails: queryOptions({
    queryKey: ['settings', 'emails'],
    queryFn: () => window.yayWholesaleB2BAdmin.wholesale_emails,
    initialData: () => window.yayWholesaleB2BAdmin.wholesale_emails,
    staleTime: Infinity,
  }),
};

/** ─── Mutation Keys ─────────────────────────────────── */

const SETTINGS_MUTATION_KEYS = {
  save: ['settings', 'main'] as const,
  updateEmailStatus: ['settings', 'emails', 'update-status'] as const,
  allPricing: ['settings', 'pricing'] as const,
  exportPricing: ['settings', 'pricing', 'export'] as const,
  importPricing: ['settings', 'pricing', 'import'] as const,
};

/** ─── Query Hooks ───────────────────────────────────── */

export function useSettingsQuery() {
  return useQuery(SETTINGS_QUERIES.main);
}

export function useSettingsEmailsQuery() {
  return useQuery(SETTINGS_QUERIES.emails);
}

/** ─── Mutation Hooks ────────────────────────────────── */

export function useSaveSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: SETTINGS_MUTATION_KEYS.save,
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
    mutationKey: SETTINGS_MUTATION_KEYS.updateEmailStatus,
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

export function usePricingExportMutation() {
  return useMutation({
    mutationKey: SETTINGS_MUTATION_KEYS.exportPricing,
    mutationFn: async () => exportPricingCsv(),
  });
}

export function usePricingImportMutation() {
  return useMutation({
    mutationKey: SETTINGS_MUTATION_KEYS.importPricing,
    mutationFn: async (formData: FormData) => importPricingCsv(formData),
  });
}

/** ─── Mutation State ────────────────────────────────── */

export function useIsMutatingSettings() {
  return useIsMutating({ mutationKey: SETTINGS_MUTATION_KEYS.save }) > 0;
}

export function useIsMutatingPricing() {
  return useIsMutating({ mutationKey: SETTINGS_MUTATION_KEYS.allPricing }) > 0;
}
