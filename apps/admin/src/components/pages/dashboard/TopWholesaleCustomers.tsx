import { useContext, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Crown } from 'lucide-react';

import { TopWholesalerValue } from '@/lib/schema/reports';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { dashboardContext } from './DashboardPage';

export default function TopWholesaleCustomers() {
  const { reportData, isFetching, isLoading } = useContext(dashboardContext);

  const columns: ColumnDef<TopWholesalerValue>[] = useMemo(
    () => [
      {
        id: 'no',
        header: () => (
          <span className="flex items-center justify-center font-medium text-gray-700">
            {__('No', 'yay-wholesale')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="flex justify-center">
            {reportData.topWholesalers.indexOf(row.original) + 1}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: __('Customer', 'yay-wholesale'),
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
                {reportData.topWholesalers.indexOf(row.original) < 3 && (
                  <Crown fill="#F9BD09" size={14} className="ml-1 text-[#F9BD09]" />
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'orderCount',
        header: () => (
          <span className="flex items-center justify-center font-medium text-gray-700">
            {__('Orders', 'yay-wholesale')}
          </span>
        ),
        cell: ({ row }) => <span className="flex justify-center">{row.original.orderCount}</span>,
      },
      {
        accessorKey: 'role',
        header: () => (
          <span className="flex items-center justify-center font-medium text-gray-700">
            {__('Role', 'yay-wholesale')}
          </span>
        ),
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex justify-center">
              <Badge variant="ghost" className="rounded-md text-xs font-semibold">
                {c.role}
              </Badge>
            </div>
          );
        },
      },
    ],
    [reportData],
  );

  const table = useReactTable({
    data: reportData.topWholesalers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="mt-0 rounded-lg py-0 shadow-none">
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-[#18181B]">Top Wholesale Customers</h3>
        </div>

        {/* DataTable */}
        <div
          className={cn('overflow-hidden rounded-md border', isFetching && 'relative opacity-50')}
        >
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader className="text-base-foreground h-[46px] bg-[#FAFAFA]">
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <Spinner className="text-muted-foreground size-6 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
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
