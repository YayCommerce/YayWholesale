import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';

import { postSettings } from '@/lib/api/settings.api';
import type { Settings } from '@/lib/schema/settings.schema';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => window.yayWholesaleB2BAdmin.settings,
    initialData: window.yayWholesaleB2BAdmin.settings,
  });
}

export function useSaveSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['settings'],
    mutationFn: async (data: Settings) => postSettings(data),
    onSuccess: (res) => {
      window.yayWholesaleB2BAdmin.settings = res.data;
      queryClient.invalidateQueries({ queryKey: ['settings'] });

      if (!queryClient.isFetching({ queryKey: ['roles'] })) {
        queryClient.invalidateQueries({ queryKey: ['roles'] });
      }
    },
  });
}

export function useIsMutatingSettings() {
  return useIsMutating({ mutationKey: ['settings'] });
}
