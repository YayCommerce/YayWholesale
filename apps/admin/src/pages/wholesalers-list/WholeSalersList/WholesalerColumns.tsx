import { ColumnDef } from '@tanstack/react-table';
import { __ } from '@wordpress/i18n';

import { parseWPCurrency } from '@/lib/helpers/format.helper';
import { Wholesaler } from '@/lib/schema/wholesalers.type';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { WholesalerAvatarCell } from './WholesalerAvatarCell';
import { WholesalerRoleCell } from './WholesalerRoleCell';

export const wholesalerColumns: ColumnDef<Wholesaler>[] = [
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
      const id = `select-${row.id}`;

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
      return <WholesalerAvatarCell wholesaler={row.original} />;
    },
  },

  {
    accessorKey: 'role',
    header: __('Role', 'yay-wholesale-b2b'),
    cell: ({ row }) => {
      return <WholesalerRoleCell wholesaler={row.original} />;
    },
  },
  {
    accessorKey: 'completedOrdersCount',
    header: () => <span className="flex justify-center">{__('Completed Orders', 'yay-wholesale-b2b')}</span>,
    cell: ({ row }) => {
      const count = row.original.completedOrdersCount ?? 0;
      return (
        <span
          className={cn('flex justify-center', count > 0 ? 'cursor-pointer hover:underline' : '')}
          onClick={() => {
            if (count > 0) {
              window.open(
                window.yayWholesaleB2BMeta.wcMeta.ordersUrl.list +
                  '&_ywhs_order_type=wholesale' +
                  '&_customer_user=' +
                  row.original.id +
                  '&status=wc-completed',
                '_blank',
              );
            }
          }}
        >
          {count}
        </span>
      );
    },
  },
  {
    accessorKey: 'wholesaleRevenue',
    header: () => <span className="flex justify-center">{__('Wholesale Revenue', 'yay-wholesale-b2b')}</span>,
    cell: ({ row }) => {
      const revenue = row.original.wholesaleRevenue ?? 0;
      return <span className="flex justify-center" dangerouslySetInnerHTML={{ __html: parseWPCurrency(revenue) }} />;
    },
  },
];
