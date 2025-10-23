import { useState } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Crown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Customer = {
  no: string;
  name: string;
  orders: number;
  role: string;
  avatar: string;
  crown?: boolean;
};

export default function TopWholesaleCustomers() {
  const [filter, setFilter] = useState('3m');

  const customers: Customer[] = [
    {
      no: '01',
      name: 'Hannah Morgan',
      orders: 50,
      role: 'Diamond',
      avatar: 'https://i.pravatar.cc/40?img=1',
      crown: true,
    },
    {
      no: '02',
      name: 'Nathaniel Boyd',
      orders: 40,
      role: 'Gold',
      avatar: 'https://i.pravatar.cc/40?img=2',
      crown: true,
    },
    {
      no: '03',
      name: 'Iris Powell',
      orders: 30,
      role: 'Diamond',
      avatar: 'https://i.pravatar.cc/40?img=3',
      crown: true,
    },
    {
      no: '04',
      name: 'Fiona Ellis',
      orders: 20,
      role: 'Silver',
      avatar: 'https://i.pravatar.cc/40?img=4',
    },
    {
      no: '05',
      name: 'Emily West',
      orders: 10,
      role: 'Diamond',
      avatar: 'https://i.pravatar.cc/40?img=5',
    },
    {
      no: '06',
      name: 'Lucy Freeman',
      orders: 50,
      role: 'Diamond',
      avatar: 'https://i.pravatar.cc/40?img=6',
    },
    {
      no: '07',
      name: 'Audrey Bennett',
      orders: 50,
      role: 'Gold',
      avatar: 'https://i.pravatar.cc/40?img=7',
    },
    {
      no: '08',
      name: 'Dean Simmons',
      orders: 50,
      role: 'Diamond',
      avatar: 'https://i.pravatar.cc/40?img=8',
    },
    {
      no: '09',
      name: 'Kate Richards',
      orders: 50,
      role: 'Gold',
      avatar: 'https://i.pravatar.cc/40?img=9',
    },
    {
      no: '10',
      name: 'Emily Bell',
      orders: 50,
      role: 'Diamond',
      avatar: 'https://i.pravatar.cc/40?img=10',
    },
  ];

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'no',
      header: 'No',
      cell: ({ row }) => <span>{row.getValue('no')}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Customer',
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8">
              <img
                src={c.avatar}
                alt={c.name}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[15px] font-medium text-[#18181B]">{c.name}</span>
              {c.crown && <Crown fill="#F9BD09" size={14} className="ml-1 text-[#F9BD09]" />}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'orders',
      header: 'Order number',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const c = row.original;
        return (
          <Badge variant="ghost" className="rounded-md text-xs font-semibold">
            {c.role}
          </Badge>
        );
      },
    },
  ];

  const table = useReactTable({
    data: customers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="mt-0 rounded-lg py-0 shadow-none">
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-[#18181B]">Top Wholesale Customers</h3>
          <ButtonGroup>
            <Button
              className={`text-sm font-medium ${
                filter === '3m' ? 'bg-accent text-accent-foreground' : 'text-[#171719B2]'
              }`}
              variant="outline"
              size="sm"
              onClick={() => setFilter('3m')}
            >
              Last 3 months
            </Button>
            <Button
              className={`text-sm font-medium ${
                filter === '30d' ? 'bg-accent text-accent-foreground' : 'text-[#171719B2]'
              }`}
              variant="outline"
              size="sm"
              onClick={() => setFilter('30d')}
            >
              Last 30 days
            </Button>
            <Button
              className={`text-sm font-medium ${
                filter === '7d' ? 'bg-accent text-accent-foreground' : 'text-[#171719B2]'
              }`}
              variant="outline"
              size="sm"
              onClick={() => setFilter('7d')}
            >
              Last 7 days
            </Button>
          </ButtonGroup>
        </div>

        {/* DataTable */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-[#F4F4F5]">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 text-[14px] text-[#18181B]">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
