import { useMutation, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';

import { api } from '@/lib/api';
import type { SettingsFormData } from '@/lib/schema';
import { showToast } from '@/components/custom/showToast';

export async function postSettings(data: SettingsFormData) {
  const response = await api.post('settings', { json: data });
  return response.json();
}

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
