import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { __ } from '@wordpress/i18n';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useDeleteRequestMutation } from '@/lib/queries/requests';
import { RequestFormValues } from '@/lib/schema/requests';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { WholeSaleToolTip } from '@/components/custom/WholeSaleToolTip';
import SettingsIcon from '@/components/icons/SettingsIcon';

import { parseWPDate, parseWPTime } from '../../common.helper';
import RequestsStatusColumn from './RequestsStatusColumn';

function AvatarCell({ rowData }: { rowData: RequestFormValues }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { avatar, name, id, email } = rowData;
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p
          className="cursor-pointer leading-none font-medium hover:underline"
          onClick={() => {
            queryClient.setQueryData(['request', id], rowData);
            navigate(`/request/edit/${id}`);
          }}
        >
          {name}
        </p>
        <p className="text-muted-foreground text-xs">{email}</p>
      </div>
    </div>
  );
}

export const RequestsColumn: ColumnDef<RequestFormValues>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        className="size-4"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="size-4"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return <AvatarCell rowData={row.original} />;
    },
  },
  // { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <RequestsStatusColumn requestId={row.original.id} defaultValue={row.original.status} />
    ),
  },
  {
    accessorKey: 'date',
    header: 'Registration Date',
    cell: ({ row }) => {
      return parseWPDate(row.original.date) + ' ' + parseWPTime(row.original.date);
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const { mutate: deleteRequest, isPending: isDeletingRequestPending } =
        useDeleteRequestMutation(row.original.id);
      const navigate = useNavigate();
      const queryClient = useQueryClient();

      const [openDialog, setOpenDialog] = useState(false);

      return (
        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
          <div className="flex justify-end gap-2">
            <WholeSaleToolTip
              trigger={
                <Button
                  size="icon"
                  variant="ghost"
                  className="hover:text-primary text-base-muted-foreground h-8 w-8 transition hover:bg-white hover:shadow-xs"
                  onClick={() => {
                    queryClient.setQueryData(['request', row.original.id], row.original);
                    navigate(`/request/edit/${row.original.id}`);
                  }}
                >
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              }
              content={<span>{__('Edit request', 'yay-wholesale')}</span>}
            />

            <WholeSaleToolTip
              trigger={
                <Button
                  size="icon"
                  variant="ghost"
                  className="hover:text-destructive text-base-muted-foreground h-8 w-8 hover:bg-white hover:shadow-xs"
                  onClick={() => setOpenDialog(true)}
                  disabled={
                    isDeletingRequestPending ||
                    queryClient.isMutating({ mutationKey: ['requests'] }) > 0
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
              content={<span>{__('Delete request', 'yay-wholesale')}</span>}
            />
          </div>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {__('Are you sure you want to delete this request?', 'yay-wholesale')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {__(
                  'This action cannot be undone. This will permanently delete this request and remove data from servers',
                  'yay-wholesale',
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{__('Cancel', 'yay-wholesale')}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
                onClick={() => deleteRequest()}
              >
                {__('Continue', 'yay-wholesale')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];
