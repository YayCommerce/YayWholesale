import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Plus, Search, XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  useBulkUpdateRoleStatusMutation,
  useDeleteManyRolesMutation,
  useRolesQuery,
} from '@/lib/queries/roles';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, InputSuffix } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DeleteIcon from '@/components/icons/DeleteIcon';

import { RolesColumn } from './roles-table/RolesColumn';

export default function RolesList() {
  const navigate = useNavigate();
  const [selectValue, setSelectValue] = useState('');
  const { data, isLoading: isLoadingRoles } = useRolesQuery();

  const { mutate: deleteManyRolesByIds, isPending: isDeletingManyRolesPending } =
    useDeleteManyRolesMutation();
  const { mutate: bulkUpdateRoleStatus, isPending: isBulkUpdatingRoleStatusPending } =
    useBulkUpdateRoleStatusMutation();

  const roles = useMemo(() => (data ? [...data].reverse() : []), [data]);
  const [search, setSearch] = useState('');
  const filteredData = useMemo(
    () =>
      roles
        .filter(
          (role) =>
            role.name.toLowerCase().includes(search.toLowerCase()) ||
            (role.description?.toLowerCase().includes(search.toLowerCase()) ?? false),
        )
        .map((role) => ({ ...role, count: role.count ?? 0 })),
    [roles, search],
  );

  const table = useReactTable({
    data: filteredData,
    columns: RolesColumn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const selectedRowsIds = table.getSelectedRowModel().rows.map((row) => row.original.id);

  const clearSelection = () => {
    table.resetRowSelection();
  };

  const handleBulkDelete = () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedCount} ${selectedCount > 1 ? 'roles' : 'role'}?`,
      )
    )
      return;
    deleteManyRolesByIds(selectedRowsIds, {
      onSuccess: () => {
        clearSelection();
      },
    });
  };

  return (
    <Card className="gap-4 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{__('Roles')}</h1>
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
      <div
        className={cn(
          'overflow-hidden rounded-lg border border-gray-200',
          (isDeletingManyRolesPending || isBulkUpdatingRoleStatusPending) && 'relative opacity-50',
        )}
      >
        {/* Overlay Spinner */}
        {(isDeletingManyRolesPending || isBulkUpdatingRoleStatusPending) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <Spinner className="text-muted-foreground size-6 animate-spin" />
          </div>
        )}

        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className="text-base-foreground h-[46px] bg-[#FAFAFA]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'text-base-secondary py-2 text-sm font-medium',
                      header.column.columnDef.meta?.align === 'center'
                        ? 'text-center'
                        : 'text-left',
                      header.column.columnDef.meta?.isCheckbox ? 'w-[36px] pr-0 pl-2' : 'px-3',
                    )}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="divide-y divide-gray-200">
            {isLoadingRoles ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-32 text-center align-middle"
                >
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Spinner className="text-muted-foreground size-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'text-base-foreground h-[53px] text-sm font-normal',
                        cell.column.columnDef.meta?.align === 'center'
                          ? 'text-center'
                          : 'text-left',
                        cell.column.columnDef.meta?.isCheckbox ? 'w-[36px] pr-0 pl-2' : 'px-3',
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-32 text-center align-middle"
                >
                  {__('No roles found.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}

      {/* Pagination Footer */}
      {filteredData.length > 0 && (
        <div className="flex h-[46px] items-center justify-between">
          {/* Left side - Bulk actions or empty */}
          <div className="flex items-center gap-4">
            {selectedCount > 1 &&
              !isBulkUpdatingRoleStatusPending &&
              !isDeletingManyRolesPending && (
                <div className="border-border flex items-center gap-2 rounded-md border px-1.5 py-1 shadow-[0_1px_2px_0_#0000000D]">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-foreground text-muted-foreground h-6 w-6 shrink-0 hover:bg-transparent"
                    onClick={clearSelection}
                    aria-label="Clear selection"
                  >
                    <XIcon className="size-4" />
                  </Button>
                  <span className="text-sm font-normal text-[#151619]">
                    {selectedCount} {__('selected')}
                  </span>
                  <span className="h-5 w-px border-r border-solid border-[#F4F4F5]" aria-hidden />
                  <Select
                    value={selectValue}
                    onValueChange={(newValue) => {
                      const status = newValue === 'set-active';
                      setSelectValue(newValue);
                      bulkUpdateRoleStatus(
                        { ids: selectedRowsIds, status },
                        {
                          onSuccess: () => {
                            clearSelection();
                            setSelectValue('');
                          },
                        },
                      );
                    }}
                  >
                    <SelectTrigger
                      icon={<ChevronsUpDown className="size-4" />}
                      className="data-[placeholder]:text-base-secondary h-8 w-[80px] gap-2 border-none bg-transparent px-0 text-sm font-normal shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    >
                      <SelectValue placeholder={__('Status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="set-active">{__('Active')}</SelectItem>
                      <SelectItem value="set-inactive">{__('Inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="h-5 w-px border-r border-solid border-[#F4F4F5]" aria-hidden />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-destructive text-base-muted-foreground h-6 w-6 shrink-0 hover:bg-transparent"
                    onClick={handleBulkDelete}
                    aria-label="Delete selected"
                  >
                    <DeleteIcon className="size-4" />
                  </Button>
                </div>
              )}
          </div>

          {/* Right side - Pagination controls */}
          <div className="flex items-center gap-4">
            <span className="text-base-secondary text-sm font-normal">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base-secondary text-sm font-normal">{__('Go to')}</span>
              <Input
                type="number"
                min={1}
                max={table.getPageCount()}
                value={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  if (page >= 0 && page < table.getPageCount()) {
                    table.setPageIndex(page);
                  }
                }}
                className="text-base-secondary h-9 w-15 rounded-sm text-sm font-normal"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
