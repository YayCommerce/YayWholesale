import { ColumnDef } from '@tanstack/react-table';
import { Settings, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { RequestFormValues } from '@/lib/schema/requests';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import { parseWPDate, parseWPTime } from '../../common.helper';
import { StatusBadge } from '../StatusBadge';

function AvatarCell({
  id,
  name,
  email,
  avatar,
}: Pick<RequestFormValues, 'id' | 'name' | 'email' | 'avatar'>) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p
          className="cursor-pointer leading-none font-medium hover:underline"
          onClick={() => navigate(`/request/edit/${id}`)}
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
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
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
      const { id, name, email, avatar } = row.original;
      return <AvatarCell id={id} name={name} email={email} avatar={avatar} />;
    },
  },
  // { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
    cell: () => (
      <div className="flex justify-end gap-2">
        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-gray-800">
          <Settings className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
