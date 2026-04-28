import { useMutation, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';

import { postSettings } from '@/lib/api/settings.api';
import type { SettingsFormData } from '@/lib/schema/settings';
import { toast } from '@/components/ui/sonner';

export function useSaveSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['settings'],
    mutationFn: async (data: SettingsFormData) => postSettings(data),
    onSuccess: () => {
      toast.success(__('Settings saved!', 'yay-wholesale-b2b'));
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      if (!queryClient.isFetching({ queryKey: ['roles'] })) {
        queryClient.invalidateQueries({ queryKey: ['roles'] });
      }
    },
    onError: () => {
      toast.error(__('Oops! Something went wrong!', 'yay-wholesale-b2b'));
    },
  });
}
