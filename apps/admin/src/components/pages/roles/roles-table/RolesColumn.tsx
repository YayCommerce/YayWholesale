import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { __ } from '@wordpress/i18n';
import { Ellipsis } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useDeleteRoleMutation, useUpdateRoleStatusMutation } from '@/lib/queries/roles';
import { RolesListValues } from '@/lib/schema/roles';
import { cn } from '@/lib/utils';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { WholeSaleToolTip } from '@/components/custom/WholeSaleToolTip';
import DeleteIcon from '@/components/icons/DeleteIcon';
import EditIcon from '@/components/icons/SettingsIcon';

import { formatWooPrice } from '../roles.helper';
import RoleStatusSwitch from './RoleStatusSwitch';

export const RolesColumn = (
  showActionsId: number,
): ColumnDef<RolesListValues & { count: number }>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex justify-center">
        <Checkbox
          className="size-4"
          checked={table.getIsAllRowsSelected()}
          onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Checkbox
          className="size-4"
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      </div>
    ),
    meta: { align: 'center', isCheckbox: true },
    size: 36,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const navigate = useNavigate();
      return (
        <div
          onClick={() => navigate(`/roles/edit/${row.original.id}`)}
          className="cursor-pointer hover:underline"
        >
          {row.original.name}
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    size: 220,
  },
  {
    accessorKey: 'count',
    header: 'Count',
    cell: (column) => {
      const count = column.row.original.count;
      return (
        <div
          className={cn('text-center', count > 0 ? 'cursor-pointer hover:underline' : '')}
          onClick={() => {
            if (count > 0) {
              window.open(
                window.yayWholesale.user_urls.list + '?role=' + column.row.original.slug,
                '_blank',
              );
            }
          }}
        >
          {count}
        </div>
      );
    },
    meta: { align: 'center' },
    size: 80,
  },
  {
    accessorKey: 'discount',
    header: 'Discount',
    cell: (column) => <div className="text-center">{column.row.original.discount}%</div>,
    meta: { align: 'center' },
    size: 80,
  },
  {
    accessorKey: 'minOrderQuantity',
    header: () => (
      <WholeSaleToolTip
        trigger={
          <div className="border-border inline-block border-b-2 border-dotted pb-px">MOQ</div>
        }
        content={<span>{__('Minimum order quantity')}</span>}
      />
    ),
    cell: (column) => <div className="text-center">{column.row.original.minOrderQuantity}</div>,
    meta: { align: 'center' },
    size: 80,
  },
  {
    accessorKey: 'minOrderAmount',
    header: () => (
      <WholeSaleToolTip
        trigger={
          <div className="border-border inline-block border-b-2 border-dotted pb-px">MOA</div>
        }
        content={<span>{__('Minimum order amount')}</span>}
      />
    ),
    cell: (column) => (
      <div
        className="text-center"
        dangerouslySetInnerHTML={{ __html: formatWooPrice(column.row.original.minOrderAmount) }}
      />
    ),
    meta: { align: 'center' },
    size: 100,
  },

  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <RoleStatusSwitch id={row.original.id} status={row.original.status} />,
    size: 80,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const { mutate: deleteRoleById, isPending: isDeletingRolePending } = useDeleteRoleMutation(
        row.original.id,
      );
      const navigate = useNavigate();
      const [openDialog, setOpenDialog] = useState(false);
      return (
        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
          <div className="relative flex justify-end">
            <div className="group relative flex items-center">
              {showActionsId !== row.original.id ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-base-muted-foreground transition"
                >
                  <Ellipsis className="size-4" />
                </Button>
              ) : (
                <div className="absolute top-1/2 right-0 flex -translate-y-1/2 items-center gap-0">
                  <WholeSaleToolTip
                    trigger={
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => navigate(`/roles/edit/${row.original.id}`)}
                        className="hover:text-primary text-base-muted-foreground transition hover:bg-[#FFFFFF] hover:shadow-xs"
                      >
                        <EditIcon className="size-4" />
                      </Button>
                    }
                    content={<span>{__('Edit role')}</span>}
                  />

                  <WholeSaleToolTip
                    trigger={
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setOpenDialog(true)}
                        disabled={isDeletingRolePending}
                        className="hover:text-destructive text-base-muted-foreground hover:bg-[#FFFFFF] hover:shadow-xs"
                      >
                        <DeleteIcon className="size-4" />
                      </Button>
                    }
                    content={<span>{__('Delete role')}</span>}
                  />
                </div>
              )}
            </div>
          </div>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {__('Are you sure you want to delete this role?', 'yay-wholesale')}
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
                onClick={() => deleteRoleById()}
              >
                {__('Continue', 'yay-wholesale')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
    size: 60,
  },
];
