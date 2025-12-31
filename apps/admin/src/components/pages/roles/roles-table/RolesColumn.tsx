import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { __ } from '@wordpress/i18n';
import { Ellipsis, PencilLine } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { WholeSaleToolTip } from '@/components/custom/WholeSaleToolTip';
import DeleteIcon from '@/components/icons/DeleteIcon';
import EditIcon from '@/components/icons/SettingsIcon';

import { formatWooPrice } from '../roles.helper';
import RoleStatusSwitch from './RoleStatusSwitch';

export const RolesColumn: ColumnDef<RolesListValues & { count: number }>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Label
        htmlFor="select-all"
        className="flex h-full w-full cursor-pointer items-center justify-center px-4"
      >
        <Checkbox
          id="select-all"
          className="size-4 bg-white"
          checked={table.getIsAllRowsSelected()}
          onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
          aria-label="Select all"
        />
      </Label>
    ),
    cell: ({ row }) => {
      const id = `select-${row.id}`;

      return (
        <Label
          htmlFor={id}
          className={cn(
            'flex h-full w-full items-center justify-center px-4',
            row.original.isDefault ? 'cursor-no-drop' : 'cursor-pointer',
          )}
        >
          <Checkbox
            id={id}
            className="pointer-events-none size-4 bg-white"
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
            disabled={row.original.isDefault}
          />
        </Label>
      );
    },
    meta: { align: 'center', isCheckbox: true },
    size: 36,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: __('Name', 'yay-wholesale'),
    cell: ({ row }) => {
      return row.original.isDefault ? (
        <div className="flex gap-2">
          <WholeSaleToolTip
            trigger={
              <div className="border-border inline-block border-b-2 border-dotted pb-px">
                {row.original.name}
              </div>
            }
            content={<span>{__('Default role', 'yay-wholesale')}</span>}
          />
        </div>
      ) : (
        <div className="flex gap-2">
          <div>{row.original.name}</div>
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
    header: __('Count', 'yay-wholesale'),
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
    header: __('Discount', 'yay-wholesale'),
    cell: (column) => <div className="text-center">{column.row.original.discount}%</div>,
    meta: { align: 'center' },
    size: 80,
  },
  {
    accessorKey: 'minOrderQuantity',
    header: () => (
      <WholeSaleToolTip
        trigger={
          <div className="border-border inline-block border-b-2 border-dotted pb-px">
            {__('MOQ', 'yay-wholesale')}
          </div>
        }
        content={<span>{__('Minimum order quantity', 'yay-wholesale')}</span>}
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
          <div className="border-border inline-block border-b-2 border-dotted pb-px">
            {__('MOA', 'yay-wholesale')}
          </div>
        }
        content={<span>{__('Minimum order amount', 'yay-wholesale')}</span>}
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
    header: __('Status', 'yay-wholesale'),
    cell: ({ row }) => (
      <RoleStatusSwitch
        id={row.original.id}
        status={row.original.status}
        isDefault={row.original.isDefault ?? false}
      />
    ),
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
      const queryClient = useQueryClient();

      return (
        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
          <div className="flex w-10 items-center justify-end gap-2">
            <div className="peer flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 has-data-[state='delayed-open']:opacity-100">
              <WholeSaleToolTip
                trigger={
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      queryClient.setQueryData(['role', row.original.id], row.original);
                      navigate(`/roles/edit/${row.original.id}`);
                    }}
                    className="hover:text-primary text-muted-foreground transition hover:bg-white hover:shadow-xs"
                  >
                    <PencilLine className="size-4" />
                  </Button>
                }
                content={<span>{__('Edit role', 'yay-wholesale')}</span>}
              />

              {!row.original.isDefault ? (
                <WholeSaleToolTip
                  trigger={
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDialog(true);
                      }}
                      disabled={isDeletingRolePending}
                      className="hover:text-destructive text-muted-foreground hover:bg-white hover:shadow-xs"
                    >
                      <DeleteIcon className="size-4" />
                    </Button>
                  }
                  content={<span>{__('Delete role', 'yay-wholesale')}</span>}
                />
              ) : (
                <WholeSaleToolTip
                  trigger={
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(`/settings/general`)}
                      className="hover:text-primary text-muted-foreground transition hover:bg-white hover:shadow-xs"
                    >
                      <EditIcon className="size-4" />
                    </Button>
                  }
                  content={<span>{__('Setting', 'yay-wholesale')}</span>}
                />
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground absolute z-1 mr-0.5 flex h-8 w-8 duration-75 group-hover:-z-10 peer-has-data-[state='delayed-open']:-z-10"
            >
              <Ellipsis className="h-4 w-4" />
            </Button>
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
