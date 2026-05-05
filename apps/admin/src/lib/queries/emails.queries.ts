import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';

import { updateEmailStatus } from '@/lib/api/settings.api';
import { handleErrorMessage } from '../utils';

export function useWholesaleEmailsQuery() {
  return useQuery({
    queryKey: ['wholesale-emails'],
    queryFn: async () => window.yayWholesaleB2BAdmin.wholesale_emails,
    initialData: window.yayWholesaleB2BAdmin.wholesale_emails,
  });
}

export function useUpdateEmailStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['wholesale-emails', 'update-status'],
    mutationFn: async ({ emailId, status }: { emailId: string; status: boolean }) => updateEmailStatus(emailId, status),

    // Optimistic update
    onMutate: async ({ emailId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['wholesale-emails'] });

      const previousData = queryClient.getQueryData<{ id: string; status: boolean }[]>(['wholesale-emails']);

      queryClient.setQueryData<{ id: string; status: boolean }[]>(['wholesale-emails'], (old) =>
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
  });
}
