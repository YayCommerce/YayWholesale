import { useState } from 'react';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useUpdateEmailStatusMutation, useWholesaleEmailsQuery } from '@/lib/queries/emails.queries';
import { toast } from '@/components/ui/sonner';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function EmailsTab() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { data: emails } = useWholesaleEmailsQuery();
  const updateEmailStatusMutation = useUpdateEmailStatusMutation();

  async function handleStatusChange(emailId: string, status: boolean) {
    setLoadingId(emailId);
    try {
      await updateEmailStatusMutation.mutateAsync({ emailId, status });
      toast.success(__('Email status updated!', 'yay-wholesale-b2b'));
    } catch (error) {
      toast.error(await getErrorMsg(error));
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted-400 hover:bg-muted-400 border-divider border-b">
            <TableHead className="w-12"></TableHead>
            <TableHead className="text-sm font-medium">Emails</TableHead>
            <TableHead className="text-sm font-medium">Description</TableHead>
            <TableHead className="text-sm font-medium">Recipient(s)</TableHead>
            <TableHead className="w-24 text-center">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {emails?.map((email) => (
            <TableRow key={email.id} className="border-divider h-[52px] border-b last:border-0">
              <TableCell className="px-4">
                <Switch
                  disabled={loadingId === email.id}
                  checked={email.status}
                  loading={updateEmailStatusMutation.isPending && loadingId === email.id}
                  onCheckedChange={(checked) => handleStatusChange(email.id, checked)}
                />
              </TableCell>

              <TableCell className="cursor-pointer text-sm font-medium">
                <a href={email.url} className="text-primary hover:underline">
                  {email.title}
                </a>
              </TableCell>

              <TableCell className="text-foreground">{email.description}</TableCell>

              <TableCell className="text-foreground">
                {email.recipients || __('Customer', 'yay-wholesale-b2b')}
              </TableCell>

              <TableCell className="px-4 text-center">
                <a
                  href={email.url}
                  className="bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center justify-center rounded-md border px-3 py-1 text-sm font-medium shadow-xs"
                >
                  {__('Manage', 'yay-wholesale-b2b')}
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
