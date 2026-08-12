import { useIsMutating, useMutation } from '@tanstack/react-query';

import { exportPricingCsv, importPricingCsv } from '@/lib/api/pricings.api';

/** ─── Query Options ─────────────────────────────────── */

/** ─── Mutation Keys ─────────────────────────────────── */

const SETTINGS_MUTATION_KEYS = {
  allPricing: ['settings', 'pricing'] as const,
  exportPricing: ['settings', 'pricing', 'export'] as const,
  importPricing: ['settings', 'pricing', 'import'] as const,
};

/** ─── Query Hooks ───────────────────────────────────── */

/** ─── Mutation Hooks ────────────────────────────────── */

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

export function useIsMutatingPricing() {
  return useIsMutating({ mutationKey: SETTINGS_MUTATION_KEYS.allPricing }) > 0;
}
