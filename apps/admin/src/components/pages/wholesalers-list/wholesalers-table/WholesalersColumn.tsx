import { ColumnDef } from '@tanstack/react-table';

import { WholesalerFormValues } from '@/lib/schema/wholesalers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { formatWooPrice } from '@/components/pages/roles/roles.helper';

import WholesalersRoleColumn from './WholesalersRole';

function AvatarCell({ rowData }: { rowData: WholesalerFormValues }) {
  const { avatar, firstName, lastName, id, email, displayName } = rowData;
  const name = displayName ?? `${firstName} ${lastName}`;
  const userLink = window.yayWholesale.user_urls.edit.replace('%USER_ID%', id.toString());
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <a href={userLink}>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </a>
      </Avatar>
      <div>
        <a className="cursor-pointer leading-none font-medium hover:underline" href={userLink}>
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
      <div className="flex justify-center">
        <Checkbox
          className="size-4"
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Checkbox
          className="size-4"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
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
      return <AvatarCell rowData={row.original} />;
    },
  },

  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      return <WholesalersRoleColumn role={row.original.role} userId={row.original.id} />;
    },
  },
  {
    accessorKey: 'completedOrdersCount',
    header: 'Completed Orders',
    cell: ({ row }) => {
      const count = row.original.completedOrdersCount ?? 0;
      return <span className="text-center">{count}</span>;
    },
  },
  {
    accessorKey: 'wholesaleRevenue',
    header: 'Wholesale Revenue',
    cell: ({ row }) => {
      const revenue = row.original.wholesaleRevenue ?? 0;
      return <span dangerouslySetInnerHTML={{ __html: formatWooPrice(revenue) }} />;
    },
  },
];
