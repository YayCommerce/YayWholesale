import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { PencilLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

import { parseWPCurrency } from '@/lib/helpers/format.helper';
import { useDeleteRoleMutation } from '@/lib/queries/roles';
import { RolesListValues } from '@/lib/schema/roles';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DeleteIcon from '@/components/icons/DeleteIcon';
import RoleStatusSwitch from './RoleStatusSwitch';

export const RolesColumn: ColumnDef<RolesListValues & { count: number }>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        id="select-all"
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => {
      const id = `select-${row.id}`;

      return (
        <Checkbox
          id={id}
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          disabled={row.original.isDefault}
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
      return row.original.isDefault ? (
        <div className="flex gap-2">
          <WholeSaleToolTip
            trigger={
              <div className="inline-block">
                {row.original.name}
                <div className="text-foreground/45 h-0.5 -translate-y-0.5 bg-[radial-gradient(circle,currentColor_0.5px,transparent_0.8px)] bg-size-[2.25px_1.75px] bg-repeat-x"></div>
              </div>
            }
            content={<span>{__('Default role', 'yay-wholesale-b2b')}</span>}
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
    header: __('Count', 'yay-wholesale-b2b'),
    cell: (column) => {
      const count = column.row.original.count;
      return (
        <div
          className={cn('text-center', count > 0 ? 'cursor-pointer hover:underline' : '')}
          onClick={() => {
            if (count > 0) {
              window.open(window.yayWholesaleB2BAdmin.user_urls.list + '?role=' + column.row.original.slug, '_blank');
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
    header: __('Discount', 'yay-wholesale-b2b'),
    cell: (column) => <div className="text-center">{column.row.original.discount}%</div>,
    meta: { align: 'center' },
    size: 80,
  },
  {
    accessorKey: 'minOrderQuantity',
    header: () => (
      <WholeSaleToolTip
        trigger={
          <span className="inline-block p-0">
            {__('MOQ', 'yay-wholesale-b2b')}
            <div className="text-foreground/45 h-0.5 -translate-y-0.5 bg-[radial-gradient(circle,currentColor_0.5px,transparent_0.8px)] bg-size-[2.25px_1.75px] bg-repeat-x"></div>
          </span>
        }
        content={<span>{__('Minimum order quantity', 'yay-wholesale-b2b')}</span>}
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
          <span className="inline-block p-0">
            {__('MOA', 'yay-wholesale-b2b')}
            <div className="text-foreground/45 h-0.5 -translate-y-0.5 bg-[radial-gradient(circle,currentColor_0.5px,transparent_0.8px)] bg-size-[2.25px_1.75px] bg-repeat-x"></div>
          </span>
        }
        content={<span>{__('Minimum order amount', 'yay-wholesale-b2b')}</span>}
      />
    ),
    cell: (column) => (
      <div
        className="text-center"
        dangerouslySetInnerHTML={{ __html: parseWPCurrency(column.row.original.minOrderAmount) }}
      />
    ),
    meta: { align: 'center' },
    size: 100,
  },

  {
    accessorKey: 'status',
    header: __('Status', 'yay-wholesale-b2b'),
    cell: ({ row }) => (
      <RoleStatusSwitch id={row.original.id} status={row.original.status} isDefault={row.original.isDefault ?? false} />
    ),
    size: 80,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const { mutate: deleteRoleById, isPending: isDeletingRolePending } = useDeleteRoleMutation(row.original.id);
      const navigate = useNavigate();
      const [openDialog, setOpenDialog] = useState(false);
      const queryClient = useQueryClient();

      return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <div className="flex w-10 items-center justify-end gap-2">
            <div className="peer flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 has-data-[state='delayed-open']:opacity-100 has-data-[state='instant-open']:opacity-100">
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
                content={<span>{__('Edit role', 'yay-wholesale-b2b')}</span>}
              />

              <WholeSaleToolTip
                trigger={
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDialog(true);
                    }}
                    disabled={isDeletingRolePending || row.original.isDefault}
                    className="hover:text-destructive text-muted-foreground hover:bg-white hover:shadow-xs"
                  >
                    <DeleteIcon className="size-4" />
                  </Button>
                }
                content={<span>{__('Delete role', 'yay-wholesale-b2b')}</span>}
              />
            </div>
          </div>
          <DialogContent className="bw:max-w-md">
            <DialogHeader className="bw:border-b-0">
              <DialogTitle>{__('Are you sure you want to delete this role?', 'yay-wholesale-b2b')}</DialogTitle>
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
                  deleteRoleById();
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
    size: 60,
  },
];
