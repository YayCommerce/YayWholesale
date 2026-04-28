import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';

import { showToast } from '@/components/custom/showToast';
import { updateEmailStatus } from '../api/emails.api';
import { handleErrorMessage } from '../utils';

export function useWholesaleEmailsQuery() {
  return useQuery({
    queryKey: ['wholesale_emails'],
    queryFn: async () => window.yayWholesaleB2BAdmin.wholesale_emails,
    initialData: window.yayWholesaleB2BAdmin.wholesale_emails,
  });
}

export function useUpdateEmailStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['update_email_status'],
    mutationFn: async ({ emailId, status }: { emailId: string; status: boolean }) => updateEmailStatus(emailId, status),

    // Optimistic update
    onMutate: async ({ emailId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['wholesale_emails'] });

      const previousData = queryClient.getQueryData<{ id: string; status: boolean }[]>(['wholesale_emails']);

      queryClient.setQueryData<{ id: string; status: boolean }[]>(['wholesale_emails'], (old) =>
        old?.map((e) => (e.id === emailId ? { ...e, status } : e)),
      );

      return { previousData };
    },

    onError: (err, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['wholesale_emails'], context.previousData);
      }
      handleErrorMessage(err);
    },

    onSuccess: () => {
      showToast.success(__('Email status updated!', 'yay-wholesale-b2b'));
    },
  });
}
