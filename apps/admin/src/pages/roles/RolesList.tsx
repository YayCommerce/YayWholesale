import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronsUpDown, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import { useBulkUpdateRoleStatusMutation, useDeleteManyRolesMutation, useRolesQuery } from '@/lib/queries/roles';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BulkActionBox, BulkActionCloseButton } from '@/components/ui/bulk-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Pagination } from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
import DeleteIcon from '@/components/icons/DeleteIcon';
import { RolesColumn } from './roles-table/RolesColumn';

export default function RolesList() {
  const navigate = useNavigate();
  const { data, isLoading: isLoadingRoles, isFetching: isFetchingRoles } = useRolesQuery();
  const queryClient = useQueryClient();

  const { mutate: deleteManyRolesByIds, isPending: isDeletingManyRolesPending } = useDeleteManyRolesMutation();
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

  const totalCount = useMemo(() => filteredData.length, [filteredData]);

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
  const selectedRowsIds = useMemo(
    () => table.getSelectedRowModel().rows.map((row) => row.original.id),
    [selectedCount],
  );

  const clearSelection = () => {
    table.resetRowSelection();
  };

  const handleBulkDelete = () => {
    if (isDeletingManyRolesPending || isBulkUpdatingRoleStatusPending || isFetchingRoles) return;
    deleteManyRolesByIds(selectedRowsIds, {
      onSuccess: () => {
        clearSelection();
      },
    });
    setOpenDeleteDialog(false);
  };

  return (
    <Card className="gap-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{__('Roles', 'yay-wholesale-b2b')}</h1>
          {filteredData && totalCount > 0 && (
            <WholeSaleToolTip
              trigger={
                <div>
                  <Badge variant="secondary" className="h-5 min-w-5 px-1 tabular-nums">
                    {totalCount}
                  </Badge>
                </div>
              }
              content={
                totalCount > 1
                  ? sprintf(__('%d roles in total', 'yay-wholesale-b2b'), totalCount)
                  : __('1 role in total', 'yay-wholesale-b2b')
              }
              side="bottom"
            />
          )}
        </div>
        <div className="flex flex-col-reverse flex-nowrap items-end gap-4 sm:flex-row sm:items-center">
          {roles.length > 10 && (
            <InputGroup className="w-full sm:w-80">
              <InputGroupInput
                placeholder={__('Search', 'yay-wholesale-b2b')}
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
            className="hover:bg-primary hover:text-primary-foreground gap-0.25 rounded-sm px-4 leading-0 shadow-xs"
            onClick={() => navigate('/roles/new')}
          >
            <Plus className="h-4 w-4" />
            <span className="px-0.75">{__('Add New Role', 'yay-wholesale-b2b')}</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div
        className={cn(
          'relative overflow-x-auto rounded-lg border',
          (isDeletingManyRolesPending || isBulkUpdatingRoleStatusPending) && 'relative opacity-50',
        )}
      >
        {/* Overlay Spinner */}
        {(isDeletingManyRolesPending || isBulkUpdatingRoleStatusPending) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <Spinner className="text-muted-foreground size-6 animate-spin" />
          </div>
        )}

        <Table className="min-w-full">
          <TableHeader className="text-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-divider border-b">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.columnDef.meta?.align === 'center' ? 'text-center' : 'text-left',
                      header.column.columnDef.meta?.isCheckbox ? 'w-9' : 'px-3',
                    )}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoadingRoles ? (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-32 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="text-muted-foreground size-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="group not-last:border-divider not-last:border-b">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.columnDef.meta?.align === 'center' ? 'text-center' : 'text-left',
                        cell.column.columnDef.meta?.isCheckbox ? 'w-9' : 'px-3',
                        cell.column.id === 'actions' && 'm-0 flex w-25 justify-end lg:w-full',
                        ['select', 'actions', 'status'].indexOf(cell.column.id) < 0 && 'cursor-pointer',
                      )}
                      onClick={() => {
                        if (['select', 'actions', 'status'].indexOf(cell.column.id) < 0) {
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
                <TableCell colSpan={table.getAllColumns().length} className="h-32 text-center align-middle">
                  {__('No roles found.', 'yay-wholesale-b2b')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}

      {/* Pagination Footer */}
      {(table.getPageCount() > 1 || selectedCount > 1) && (
        <div className="relative flex flex-col items-center gap-3 sm:flex-row">
          <BulkActionBox visible={selectedCount > 1}>
            <BulkActionCloseButton onClick={() => table.resetRowSelection()} />
            <span>{sprintf(__('%d selected', 'yay-wholesale-b2b'), selectedCount)}</span>
            <Separator orientation="vertical" className="ml-2 h-5!" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hover:text-primary hover:bg-primary/6 group flex gap-1.5 px-2.5">
                  <span className="text-sm font-normal">{__('Status', 'yay-wholesale-b2b')}</span>
                  <span className="group-hover:text-primary text-muted-foreground flex items-center">
                    <ChevronsUpDown className="size-3.5 stroke-[2.5px]" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={9} className="w-fit min-w-[20px] p-1">
                <DropdownMenuItem
                  onClick={() => {
                    if (isDeletingManyRolesPending || isBulkUpdatingRoleStatusPending || isFetchingRoles) return;
                    bulkUpdateRoleStatus(
                      { ids: selectedRowsIds, status: true },
                      {
                        onSuccess: () => {
                          clearSelection();
                        },
                      },
                    );
                  }}
                >
                  {__('Active', 'yay-wholesale-b2b')}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    if (isDeletingManyRolesPending || isBulkUpdatingRoleStatusPending || isFetchingRoles) return;
                    bulkUpdateRoleStatus(
                      { ids: selectedRowsIds, status: false },
                      {
                        onSuccess: () => {
                          clearSelection();
                        },
                      },
                    );
                  }}
                >
                  {__('Inactive', 'yay-wholesale-b2b')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="border-divider h-5 w-px border-r border-solid" aria-hidden />
            <Dialog open={openBulkDeleteDialog} onOpenChange={setOpenDeleteDialog}>
              <WholeSaleToolTip
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-destructive text-muted-foreground h-8 w-8 shrink-0 hover:bg-transparent hover:shadow-sm"
                    onClick={() => setOpenDeleteDialog(true)}
                    aria-label="Delete selected"
                  >
                    <DeleteIcon className="size-4" />
                  </Button>
                }
                content={<span>{__('Delete', 'yay-wholesale-b2b')}</span>}
              />
              <DialogContent className="bw:max-w-md">
                <DialogHeader className="bw:border-b-0">
                  <DialogTitle>
                    {sprintf(__(`Are you sure you want to delete %d roles ?`, 'yay-wholesale-b2b'), selectedCount)}
                  </DialogTitle>
                  <DialogDescription>
                    {__(
                      'This action cannot be undone. This will permanently delete these request and remove data from servers',
                      'yay-wholesale-b2b',
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">{__('Cancel', 'yay-wholesale-b2b')}</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={() => handleBulkDelete()}>
                    {__('Continue', 'yay-wholesale-b2b')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </BulkActionBox>

          {/* Right side - Pagination controls */}
          {table.getPageCount() > 1 && (
            <Pagination
              pageIndex={table.getState().pagination.pageIndex}
              pageCount={table.getPageCount()}
              onPreviousPage={() => table.previousPage()}
              onNextPage={() => table.nextPage()}
              onPageChange={(page) => table.setPageIndex(page)}
              canPreviousPage={table.getCanPreviousPage()}
              canNextPage={table.getCanNextPage()}
              className="sm:ms-auto"
            />
          )}
        </div>
      )}
    </Card>
  );
}
