import { useState } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Crown } from 'lucide-react';

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

type Product = {
  no: string;
  name: string;
  items: number;
  sales: string;
  image: string;
  crown?: boolean;
};

export default function TopProducts() {
  const [filter, setFilter] = useState<'3m' | '30d' | '7d'>('3m');

  const products: Product[] = [
    {
      no: '01',
      name: 'Classic Cotton T-Shirt',
      items: 50,
      sales: '$10,000',
      image: 'https://i.pravatar.cc/40?img=7',
      crown: true,
    },
    {
      no: '02',
      name: 'Everyday Essential Tee',
      items: 50,
      sales: '$10,000',
      image: 'https://i.pravatar.cc/40?img=7',
      crown: true,
    },
    {
      no: '03',
      name: 'Premium Crewneck Tee',
      items: 50,
      sales: '$10,000',
      image: 'https://i.pravatar.cc/40?img=7',
      crown: true,
    },
    {
      no: '04',
      name: 'Relax Fit Cotton Tee',
      items: 50,
      sales: '$10,000',
      image: 'https://i.pravatar.cc/40?img=7',
    },
    {
      no: '05',
      name: 'SoftTouch Basic Tee',
      items: 50,
      sales: '$10,000',
      image: 'https://i.pravatar.cc/40?img=7',
    },
    {
      no: '06',
      name: 'Organic Cotton T-Shirt',
      items: 50,
      sales: '$10,000',
      image: 'https://i.pravatar.cc/40?img=7',
    },
    {
      no: '07',
      name: 'EcoFlex Bamboo Tee',
      items: 50,
      sales: '$10,000',
      image: 'https://i.pravatar.cc/40?img=7',
    },
    {
      no: '08',
      name: 'Recycled Fiber T-Shirt',
      items: 50,
      sales: '$10,000',
      image: 'https://i.pravatar.cc/40?img=7',
    },
    {
      no: '09',
      name: 'EarthTone Natural Tee',
      items: 50,
      sales: '$10,000',
      image: 'https://i.pravatar.cc/40?img=7',
    },
    {
      no: '10',
      name: 'GreenWear Everyday Tee',
      items: 50,
      sales: '$10,000',
      image: 'https://i.pravatar.cc/40?img=7',
    },
  ];

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'no',
      header: 'No',
      cell: ({ row }) => <span>{row.getValue('no')}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 overflow-hidden rounded-md border">
              <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[15px] font-medium text-[#18181B]">{p.name}</span>
              {p.crown && <Crown fill="#F9BD09" size={14} className="ml-1 text-[#F9BD09]" />}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'items',
      header: 'Items Sold',
      cell: ({ row }) => <span>{row.getValue('items')}</span>,
    },
    {
      accessorKey: 'sales',
      header: 'Net Sales',
      cell: ({ row }) => <span className="font-medium text-gray-700">{row.getValue('sales')}</span>,
    },
  ];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="mt-0 rounded-lg py-0 shadow-none">
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-[#18181B]">Top Products</h3>
          <ButtonGroup>
            <Button
              className={`text-sm font-medium ${
                filter === '3m' ? 'bg-accent text-accent-foreground' : 'text-[#171719B2]'
              }`}
              variant="outline"
              size="sm"
              onClick={() => setFilter('3m')}
            >
              Last 3 month
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
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="bg-[#F4F4F5] text-[13px] font-semibold text-[#18181B]"
                    >
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
