import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';

import { saveSetup } from '@/lib/api/wizard.api';
import { ROLES_QUERIES } from '@/lib/queries/roles.queries';
import { SETTINGS_QUERIES } from '@/lib/queries/settings.queries';
import { SetupWizardForm } from '@/lib/schema/wizard.schema';

export function useSaveSetupWizardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['setup-wizard'],
    mutationFn: async (setupWizardForm: SetupWizardForm) => saveSetup(setupWizardForm),
    onSuccess: (res) => {
      window.yayWholesaleB2BAdmin.settings = res.settings;
      queryClient.setQueryData(SETTINGS_QUERIES.main.queryKey, res.settings);
      queryClient.setQueryData(ROLES_QUERIES.all.queryKey, res.roles);
    },
    onError: () => queryClient.invalidateQueries({ queryKey: SETTINGS_QUERIES.main.queryKey }),
  });
}

export function useIsMutatingSetup() {
  return useIsMutating({ mutationKey: ['setup-wizard'] });
}
