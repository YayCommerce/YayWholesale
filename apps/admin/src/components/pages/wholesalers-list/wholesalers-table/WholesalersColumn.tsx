import { ColumnDef } from '@tanstack/react-table';
import { __ } from '@wordpress/i18n';

import { WholesalerFormValues } from '@/lib/schema/wholesalers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatWooPrice } from '@/components/pages/roles/roles.helper';

import WholesalersRoleColumn from './WholesalersRole';

function AvatarCell({ rowData }: { rowData: WholesalerFormValues }) {
  const { avatar, firstName, lastName, id, email, displayName } = rowData;
  const name = displayName ?? `${firstName} ${lastName}`;
  const userLink = window.yayWholesaleB2BAdmin.user_urls.edit.replace('%USER_ID%', id.toString());
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-9.5 w-9.5">
        <a href={userLink} target="_blank" rel="noopener noreferrer">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </a>
      </Avatar>
      <div>
        <a
          className="cursor-pointer leading-none font-medium hover:underline"
          href={userLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}
        </a>
        <p className="text-muted-foreground text-xs">{email}</p>
      </div>
    </div>
  );
}

export const WholesalersColumn: ColumnDef<WholesalerFormValues>[] = [
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
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </Label>
    ),
    cell: ({ row }) => {
      const id = `select-${row.id}`;

      return (
        <Label
          htmlFor={id}
          className="flex h-full w-full cursor-pointer items-center justify-center px-4"
        >
          <Checkbox
            id={id}
            className="size-4 bg-white"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
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
    header: __('Name', 'yay-wholesale-b2b'),
    cell: ({ row }) => {
      return <AvatarCell rowData={row.original} />;
    },
  },

  {
    accessorKey: 'role',
    header: __('Role', 'yay-wholesale-b2b'),
    cell: ({ row }) => {
      return <WholesalersRoleColumn role={row.original.role} userId={row.original.id} />;
    },
  },
  {
    accessorKey: 'completedOrdersCount',
    header: () => (
      <span className="flex justify-center">{__('Completed Orders', 'yay-wholesale-b2b')}</span>
    ),
    cell: ({ row }) => {
      const count = row.original.completedOrdersCount ?? 0;
      return <span className="flex justify-center">{count}</span>;
    },
  },
  {
    accessorKey: 'wholesaleRevenue',
    header: () => (
      <span className="flex justify-center">{__('Wholesale Revenue', 'yay-wholesale-b2b')}</span>
    ),
    cell: ({ row }) => {
      const revenue = row.original.wholesaleRevenue ?? 0;
      return (
        <span
          className="flex justify-center"
          dangerouslySetInnerHTML={{ __html: formatWooPrice(revenue) }}
        />
      );
    },
  },
];
