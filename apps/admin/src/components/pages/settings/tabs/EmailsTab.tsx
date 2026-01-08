import { useState } from 'react';
import { __ } from '@wordpress/i18n';

import { useUpdateEmailStatusMutation, useWholesaleEmailsQuery } from '@/lib/queries/emails';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function EmailsTab() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { data: emails } = useWholesaleEmailsQuery();
  const { mutate } = useUpdateEmailStatusMutation();

  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted-400 hover:bg-muted-400 border-border border-b">
            <TableHead className="w-12"></TableHead>
            <TableHead className="text-sm font-medium">Emails</TableHead>
            <TableHead className="text-sm font-medium">Description</TableHead>
            <TableHead className="text-sm font-medium">Recipient(s)</TableHead>
            <TableHead className="w-24 text-center">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {emails?.map((email) => (
            <TableRow key={email.id} className="border-border h-[52px] border-b last:border-0">
              <TableCell className="px-4">
                <Switch
                  disabled={loadingId === email.id}
                  size="md"
                  checked={email.status}
                  onCheckedChange={(checked) => {
                    setLoadingId(email.id);
                    mutate(
                      { emailId: email.id, status: checked },
                      { onSettled: () => setLoadingId(null) },
                    );
                  }}
                />
              </TableCell>

              <TableCell className="cursor-pointer text-sm font-medium">
                <a href={email.url} className="text-primary hover:underline">
                  {email.title}
                </a>
              </TableCell>

              <TableCell className="text-foreground">{email.description}</TableCell>

              <TableCell className="text-foreground">
                {email.recipients || __('Customer', 'yay-wholesale')}
              </TableCell>

              <TableCell className="px-4 text-center">
                <a
                  href={email.url}
                  className="bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center justify-center rounded-md border px-3 py-1 text-sm font-medium shadow-xs"
                >
                  {__('Manage', 'yay-wholesale')}
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
