import { useState } from 'react';
import { DialogClose } from '@radix-ui/react-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

import { parseWPDate, parseWPTime } from '@/lib/helpers/format.helper';
import { cacheRequest, useDeleteRequestMutation } from '@/lib/queries/requests.queries';
import { Request } from '@/lib/schema/requests.type';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DeleteIcon from '@/components/icons/DeleteIcon';
import SettingsIcon from '@/components/icons/SettingsIcon';
import { RequestAvatarCell } from './RequestAvatarCell';
import { RequestStatusCell } from './RequestStatusCell';

export const requestColumns: ColumnDef<Request>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        id="select-all"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => {
      const id = `select-${row.original.id}`;

      return (
        <Checkbox
          id={id}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      );
    },
    meta: { align: 'center', isCheckbox: true },
    size: 36,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: __('Name', 'yay-wholesale-b2b'),
    cell: ({ row }) => {
      return <RequestAvatarCell request={row.original} />;
    },
  },
  {
    accessorKey: 'date',
    header: __('Registration Date', 'yay-wholesale-b2b'),
    cell: ({ row }) => {
      return parseWPDate(row.original.date) + ' ' + parseWPTime(row.original.date);
    },
  },
  // { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'status',
    header: __('Status', 'yay-wholesale-b2b'),
    cell: ({ row }) => <RequestStatusCell request={row.original} />,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const { mutate: deleteRequest, isPending: isDeletingRequestPending } = useDeleteRequestMutation(row.original.id);
      const navigate = useNavigate();
      const queryClient = useQueryClient();
      const [openDialog, setOpenDialog] = useState(false);

      return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <div className="flex w-10 items-center justify-end gap-2">
            <div className="peer flex gap-1.5 opacity-0 group-hover:opacity-100 has-data-[state='delayed-open']:opacity-100 has-data-[state='instant-open']:opacity-100">
              <WholeSaleToolTip
                trigger={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:text-primary text-muted-foreground h-8 w-8 hover:bg-white hover:shadow-xs"
                    onClick={() => {
                      cacheRequest(queryClient, row.original);
                      navigate(`/request/edit/${row.original.id}`);
                    }}
                  >
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                }
                content={<span>{__('See details', 'yay-wholesale-b2b')}</span>}
              />

              <WholeSaleToolTip
                trigger={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:text-destructive text-muted-foreground m-0 h-8 w-8 hover:bg-white hover:shadow-xs"
                    onClick={() => setOpenDialog(true)}
                    disabled={isDeletingRequestPending || queryClient.isMutating({ mutationKey: ['requests'] }) > 0}
                  >
                    <DeleteIcon className="h-4 w-4" />
                  </Button>
                }
                content={<span>{__('Delete request', 'yay-wholesale-b2b')}</span>}
              />
            </div>
          </div>
          <DialogContent className="bw:max-w-md">
            <DialogHeader className="bw:border-b-0">
              <DialogTitle>{__('Are you sure you want to delete this request?', 'yay-wholesale-b2b')}</DialogTitle>
              <DialogDescription>
                {__(
                  'This action cannot be undone. This will permanently delete this request and remove data from servers',
                  'yay-wholesale-b2b',
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{__('Cancel', 'yay-wholesale-b2b')}</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteRequest();
                  setOpenDialog(false);
                }}
              >
                {__('Continue', 'yay-wholesale-b2b')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    },
  },
];
