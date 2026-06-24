import { ColumnDef } from '@tanstack/react-table';
import { __ } from '@wordpress/i18n';

import { parseWPDate, parseWPTime } from '@/lib/helpers/format.helper';
import { Request } from '@/lib/schema/requests.type';
import { Checkbox } from '@/components/ui/checkbox';
import { RequestActionCell } from './RequestActionCell';
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
  {
    accessorKey: 'status',
    header: __('Status', 'yay-wholesale-b2b'),
    cell: ({ row }) => <RequestStatusCell request={row.original} />,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <RequestActionCell request={row.original} />,
  },
];
