import { ColumnDef } from '@tanstack/react-table';
import { __ } from '@wordpress/i18n';

import { parseWPCurrency } from '@/lib/helpers/format.helper';
import { Role } from '@/lib/schema/roles.schema';
import { Checkbox } from '@/components/ui/checkbox';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
import { isDefaultRole } from '../roles.helper';
import { RoleActionCell } from './RoleActionCell';
import { RoleCountCell } from './RoleCountCell';
import RoleStatusSwitch from './RoleStatusSwitch';

export const roleColumns: ColumnDef<Role>[] = [
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
          disabled={isDefaultRole(row.original)}
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
      if (!isDefaultRole(row.original)) {
        return (
          <div className="flex gap-2">
            <div>{row.original.name}</div>
          </div>
        );
      } else {
        return (
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
        );
      }
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
    cell: ({ row }) => <RoleCountCell role={row.original} />,
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
    cell: ({ row }) => <RoleStatusSwitch role={row.original} />,
    size: 80,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <RoleActionCell role={row.original} />,
    size: 60,
  },
];
