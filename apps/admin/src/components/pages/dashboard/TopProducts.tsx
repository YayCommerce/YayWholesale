import { useContext, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Crown } from 'lucide-react';

import { TopProductValue } from '@/lib/schema/reports';
import { cn } from '@/lib/utils';
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

import { parseWPCurrency } from '../common.helper';
import { dashboardContext } from './DashboardPage';

export default function TopProducts() {
  const { reportData, isFetching, isLoading } = useContext(dashboardContext);

  const columns: ColumnDef<TopProductValue>[] = useMemo(
    () => [
      {
        id: 'no',
        header: () => (
          <span className="flex items-center justify-center font-medium text-gray-700">
            {__('No', 'yay-wholesale')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="flex items-center justify-center">
            {reportData.topProducts.indexOf(row.original) + 1}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: () => <span>{__('Product', 'yay-wholesale')}</span>,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 overflow-hidden rounded-md border">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex w-40 items-center gap-1 md:w-15 md:flex-wrap lg:w-40 lg:flex-nowrap">
                <span className="text-[15px] font-medium whitespace-normal text-[#18181B] md:text-[13px] lg:text-[15px]">
                  {p.name}
                </span>
                {reportData.topProducts.indexOf(row.original) < 3 && (
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
            {__('Item Sold', 'yay-wholesale')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="flex items-center justify-center">{row.original.orderCount}</span>
        ),
      },
      {
        accessorKey: 'netSale',
        header: () => (
          <span className="flex items-center justify-center font-medium text-gray-700">
            {__('Net Sales', 'yay-wholesale')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="flex items-center justify-center font-medium text-gray-700">
            {parseWPCurrency(row.original.netSale)}
          </span>
        ),
      },
    ],
    [reportData],
  );

  const table = useReactTable({
    data: reportData.topProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="mt-0 rounded-lg py-0 shadow-none">
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-[#18181B]">Top Products</h3>
        </div>

        {/* DataTable */}
        <div
          className={cn(
            'overflow-hidden rounded-md border bg-white',
            isFetching && 'relative opacity-50',
          )}
        >
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader className="text-base-foreground h-[46px] bg-[#FAFAFA]">
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
            <TableBody className="divide-y divide-gray-200">
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
