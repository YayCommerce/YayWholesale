import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Plus, Search, XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  useBulkUpdateRoleStatusMutation,
  useDeleteManyRolesMutation,
  useRolesQuery,
} from '@/lib/queries/roles';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import BulkActionBox from '@/components/ui/bulk-actions-box';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, InputSuffix } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
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
  const { data, isLoading: isLoadingRoles, isFetching: isFetchingRoles } = useRolesQuery();
  const queryClient = useQueryClient();

  const { mutate: deleteManyRolesByIds, isPending: isDeletingManyRolesPending } =
    useDeleteManyRolesMutation();
  const { mutate: bulkUpdateRoleStatus, isPending: isBulkUpdatingRoleStatusPending } =
    useBulkUpdateRoleStatusMutation();

  const roles = useMemo(() => (data ? [...data].reverse() : []), [data]);
  const [search, setSearch] = useState('');
  const [openBulkDeleteDialog, setOpenDeleteDialog] = useState(false);
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

  const columns = RolesColumn;

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: (row) => !row.original.isDefault,
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const selectedRowsIds = table.getSelectedRowModel().rows.map((row) => row.original.id);

  const clearSelection = () => {
    table.resetRowSelection();
  };

  const handleBulkDelete = () => {
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
        <div className="flex flex-col-reverse flex-nowrap items-end gap-4 sm:flex-row sm:items-center">
          {roles.length > 10 && (
            <InputGroup className="w-full sm:w-80">
              <InputGroupInput
                placeholder={__('Search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <InputGroupAddon align="inline-end">
                <Search className="size-4.5 text-[#A0A0A7]" />
              </InputGroupAddon>
            </InputGroup>
          )}
          <Button
            variant="primary-outline"
            className="hover:bg-primary/10 h-[34px] gap-2 rounded-sm px-4 text-sm font-medium"
            onClick={() => navigate('/roles/new')}
          >
            <Plus className="h-4 w-4" />
            {__('Add New Role')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        {/* Overlay Spinner */}
        {(isDeletingManyRolesPending || isBulkUpdatingRoleStatusPending) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <Spinner className="text-muted-foreground size-6 animate-spin" />
          </div>
        )}

        <Table className="min-w-full divide-y">
          <TableHeader className="text-base-foreground bg-base-muted h-[46px]">
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
                      header.column.columnDef.meta?.isCheckbox ? 'w-[36px] p-0' : 'px-3',
                    )}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="divide-y">
            {isLoadingRoles ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-32 text-center align-middle"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="text-muted-foreground size-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="group">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'text-base-foreground h-13 cursor-pointer text-sm font-normal',
                        cell.column.columnDef.meta?.align === 'center'
                          ? 'text-center'
                          : 'text-left',
                        cell.column.columnDef.meta?.isCheckbox ? 'w-[36px] p-0' : 'px-3',
                        cell.column.id === 'actions' && 'm-0 flex w-25 justify-end lg:w-full',
                      )}
                      onClick={() => {
                        if (['select', 'actions'].indexOf(cell.column.id) < 0) {
                          queryClient.setQueryData(['role', row.original.id], row.original);
                          navigate(`/roles/edit/${row.original.id}`);
                        }
                      }}
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
          <BulkActionBox
            selectedCount={selectedCount}
            onResetRow={() => table.resetRowSelection()}
            isHidingCondition={!isBulkUpdatingRoleStatusPending && !isDeletingManyRolesPending}
          >
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
                className="data-placeholder:text-base-secondary h-8 w-[80px] gap-2 border-none bg-transparent px-0 text-sm font-normal shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <SelectValue placeholder={__('Status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="set-active">{__('Active')}</SelectItem>
                <SelectItem value="set-inactive">{__('Inactive')}</SelectItem>
              </SelectContent>
            </Select>
            <span className="h-5 w-px border-r border-solid border-[#F4F4F5]" aria-hidden />
            <AlertDialog open={openBulkDeleteDialog} onOpenChange={setOpenDeleteDialog}>
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-destructive text-base-muted-foreground h-6 w-6 shrink-0 hover:bg-transparent"
                onClick={() => setOpenDeleteDialog(true)}
                aria-label="Delete selected"
              >
                <DeleteIcon className="size-4" />
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {sprintf(
                      __(`Are you sure you want to delete %d roles ?`, 'yay-wholesale'),
                      selectedCount,
                    )}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {__(
                      'This action cannot be undone. This will permanently delete these request and remove data from servers',
                      'yay-wholesale',
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{__('Cancel', 'yay-wholesale')}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
                    onClick={() => handleBulkDelete()}
                  >
                    {__('Continue', 'yay-wholesale')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </BulkActionBox>

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
                className="text-base-secondary h-9 w-15 rounded-sm text-sm font-normal focus-visible:ring-0"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
