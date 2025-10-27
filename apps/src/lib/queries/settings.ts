import { useMutation, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';

import { postSettings } from '@/lib/api/settings.api';
import type { SettingsFormData } from '@/lib/schema/settings';
import { showToast } from '@/components/custom/showToast';

export function useSaveSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['settings'],
    mutationFn: async (data: SettingsFormData) => postSettings(data),
    onSuccess: () => {
      showToast.success(__('Settings saved!'));
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: () => {
      showToast.error(__('Oops! Something went wrong!'));
    },
  });
}
