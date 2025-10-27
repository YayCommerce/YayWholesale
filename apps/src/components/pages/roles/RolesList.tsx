import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { __ } from '@wordpress/i18n';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useDeleteRoleMutation, useRolesQuery } from '@/lib/queries/roles';
import { RolesListValues } from '@/lib/schema/roles';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input, InputSuffix } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import DeleteIcon from '@/components/icons/DeleteIcon';
import EditIcon from '@/components/icons/SettingsIcon';

// Hook to handle row selection logic
function useRowSelection(rows: RolesListValues[]) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newSet = new Set(selectedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRows(newSet);
  };

  const toggleAllRows = () => {
    const allSelected = rows.every((row) => selectedRows.has(row.id));
    setSelectedRows(allSelected ? new Set() : new Set(rows.map((row) => row.id)));
  };

  return { selectedRows, toggleRow, toggleAllRows };
}

export default function RolesList() {
  const navigate = useNavigate();
  const { data } = useRolesQuery();
  const roles = useMemo(() => (data ? [...data].reverse() : []), [data]);

  const [search, setSearch] = useState('');
  const filteredData = useMemo(
    () =>
      roles.filter(
        (role) =>
          role.name.toLowerCase().includes(search.toLowerCase()) ||
          (role.description?.toLowerCase().includes(search.toLowerCase()) ?? false),
      ),
    [roles, search],
  );

  const { selectedRows, toggleRow, toggleAllRows } = useRowSelection(filteredData);

  const columnHelper = createColumnHelper<RolesListValues>();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: () => (
          <Checkbox
            checked={filteredData.length > 0 && filteredData.every((r) => selectedRows.has(r.id))}
            onCheckedChange={toggleAllRows}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedRows.has(row.original.id)}
            onCheckedChange={() => toggleRow(row.original.id)}
          />
        ),
        size: 40,
      }),
      columnHelper.accessor('name', { header: 'Name' }),
      columnHelper.accessor('description', { header: 'Description' }),
      columnHelper.accessor('count', {
        header: 'Count',
        cell: (info) => <div className="text-center">{info.getValue()}</div>,
      }),
      columnHelper.accessor('discount', {
        header: 'Discount',
        cell: (info) => <div className="text-center">{info.getValue()}</div>,
      }),
      columnHelper.accessor('minOrderQuantity', {
        header: 'Min Order Quantity',
        cell: (info) => <div className="text-center">{info.getValue()}</div>,
      }),
      columnHelper.accessor('minOrderAmount', {
        header: 'Min Order Amount',
        cell: (info) => <div className="text-center">{info.getValue()}</div>,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <Switch size="md" checked={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const { mutate: deleteRoleById, isPending: isDeletingRolePending } =
            useDeleteRoleMutation(row.original.id);
          const handleDelete = (id: string) => {
            if (!window.confirm(__('Are you sure you want to delete this role?'))) return;
            deleteRoleById();
          };
          return (
            <div className="flex justify-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate(`/roles/edit/${row.original.id}`)}
              >
                <EditIcon className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(row.original.id)}
                disabled={isDeletingRolePending}
              >
                <DeleteIcon className="size-4" />
              </Button>
            </div>
          );
        },
        size: 80,
      }),
    ],
    [selectedRows, filteredData, navigate],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card className="gap-4 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#000000]">{__('Roles')}</h1>
        <div className="flex flex-nowrap items-center gap-4">
          {roles.length > 10 && (
            <div className="relative flex-none">
              <Input
                placeholder={__('Search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-input w-80 rounded-sm border bg-white pr-9 text-sm font-normal"
              />
              <InputSuffix className="absolute top-1/2 right-3 -translate-y-1/2 bg-transparent px-0">
                <Search className="size-4.5 text-[#A0A0A7]" />
              </InputSuffix>
            </div>
          )}
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 h-[34px] gap-2 rounded-sm px-4 text-sm font-medium"
            onClick={() => navigate('/roles/new')}
          >
            <Plus className="h-4 w-4" />
            {__('Add New Role')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#FAFAFA]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left text-sm font-medium text-gray-500"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 text-sm text-gray-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-gray-500">
                  {__('No roles found.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filteredData.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            {selectedRows.size} {__('of')} {filteredData.length} {__('row(s) selected.')}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              {__('Rows per page')}
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(v) => {
                  table.setPageSize(Number(v));
                  table.setPageIndex(0);
                }}
              >
                <SelectTrigger className="h-8 w-[70px] border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="gap- flex items-center gap-2">
              <span className="mr-6 ml-4 text-sm text-[#171719]">
                {__('Page')} {table.getState().pagination.pageIndex + 1} {__('of')}{' '}
                {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
