import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { ChevronsUpDown, Loader2, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { __, sprintf } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import {
  useAllRolesQuery,
  useBulkDeleteRolesMutation,
  useBulkUpdateRoleStatusMutation,
  useIsMutatingRoles,
} from '@/lib/queries/roles.queries';
import { Role } from '@/lib/schema/roles.schema';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BulkActionBox } from '@/components/ui/bulk-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
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
import { toast } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DeleteIcon from '@/components/icons/DeleteIcon';
import { isDefaultRole } from './roles.helper';
import { roleColumns } from './RolesList/RolesColumns';

export default function RolesList() {
  const navigate = useNavigate();
  const { data: allRoles } = useAllRolesQuery();
  const bulkDeleteRolesMutation = useBulkDeleteRolesMutation();
  const bulkUpdateRoleStatusMutation = useBulkUpdateRoleStatusMutation();
  const isMutating = useIsMutatingRoles();

  const [search, setSearch] = useState('');
  const [openBulkDeleteDialog, setOpenDeleteDialog] = useState(false);

  const roles = useMemo(() => {
    // move default role to the top
    if (!allRoles) return [];
    const defaultRole = allRoles.find((role) => isDefaultRole(role));
    const otherRoles = allRoles.filter((role) => !isDefaultRole(role));

    return defaultRole ? [defaultRole, ...otherRoles] : otherRoles;
  }, [allRoles]);

  const totalCount = roles.length;
  const enableFilter = totalCount > 10;

  const table = useReactTable<Role>({
    data: roles,
    columns: roleColumns,
    initialState: {
      pagination: { pageSize: 10 },
    },
    state: { globalFilter: enableFilter ? search : undefined },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: (row) => !isDefaultRole(row.original),
  });

  async function handleBulkDelete() {
    const roleSlugs = table.getSelectedRowModel().rows.map((row) => row.original.slug);
    if (roleSlugs.length === 0 || isMutating > 0) return;

    try {
      await bulkDeleteRolesMutation.mutateAsync(roleSlugs);
      table.resetRowSelection();
    } catch (error) {
      toast.error(await getErrorMsg(error));
    } finally {
      setOpenDeleteDialog(false);
    }
  }

  async function handleBulkUpdateStatus(status: boolean) {
    const roleSlugs = table.getSelectedRowModel().rows.map((row) => row.original.slug);
    if (roleSlugs.length === 0 || isMutating > 0) return;

    try {
      await bulkUpdateRoleStatusMutation.mutateAsync({
        roleSlugs,
        status,
      });
      table.resetRowSelection();
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  const filteredCount = table.getFilteredRowModel().rows.length;
  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <Card className="gap-4 p-4 shadow-sm md:p-5 2xl:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{__('Roles', 'yay-wholesale-b2b')}</h1>
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
                : sprintf(__('%d role in total', 'yay-wholesale-b2b'), totalCount)
            }
            side="bottom"
          />
        </div>
        <div className="flex flex-1 flex-col-reverse flex-nowrap items-end justify-end gap-4 sm:flex-row sm:items-center">
          {enableFilter && (
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
          <Button variant="primary-outline-fill" onClick={() => navigate('/roles/new')}>
            <Plus className="size-4" />
            {__('Add New Role', 'yay-wholesale-b2b')}
          </Button>
        </div>
      </div>

      <div className="relative overflow-x-auto rounded-lg border">
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
            {totalCount === 0 && (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-32 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    {__('Add your first wholesale role to get started.', 'yay-wholesale-b2b')}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {totalCount > 0 && filteredCount === 0 && (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-32 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    {__('No roles found matching your search', 'yay-wholesale-b2b')}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {table.getRowModel().rows.map((row) => (
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
                        navigate(`/roles/edit/${row.original.slug}`);
                      }
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}

      <div className="relative flex flex-col items-center gap-3 sm:flex-row">
        <BulkActionBox selected={selectedCount} onClose={() => table.resetRowSelection()}>
          <span>{sprintf(__('%d selected', 'yay-wholesale-b2b'), selectedCount)}</span>
          <Separator orientation="vertical" className="ml-2 h-5!" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hover:text-primary hover:bg-primary/6 group flex gap-1.5 px-2.5">
                <span className="text-sm font-normal">{__('Status', 'yay-wholesale-b2b')}</span>
                <span className="group-hover:text-primary text-muted-foreground flex items-center">
                  {!bulkUpdateRoleStatusMutation.isPending && <ChevronsUpDown className="size-3.5 stroke-[2.5px]" />}
                  {bulkUpdateRoleStatusMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={9} className="w-fit min-w-5 p-1">
              <DropdownMenuItem onClick={() => handleBulkUpdateStatus(true)}>
                {__('Active', 'yay-wholesale-b2b')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkUpdateStatus(false)}>
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
                  className="hover:text-destructive text-muted-foreground size-8 shrink-0 hover:bg-transparent hover:shadow-sm"
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
                  {__('This action cannot be undone. This will permanently delete these roles', 'yay-wholesale-b2b')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{__('Cancel', 'yay-wholesale-b2b')}</Button>
                </DialogClose>
                <Button variant="destructive" onClick={() => handleBulkDelete()}>
                  {bulkDeleteRolesMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                  {__('Delete', 'yay-wholesale-b2b')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </BulkActionBox>

        <Pagination
          pageIndex={table.getState().pagination.pageIndex}
          pageCount={table.getPageCount()}
          onPreviousPage={() => table.previousPage()}
          onNextPage={() => table.nextPage()}
          onPageChange={(page) => table.setPageIndex(page)}
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
          className={clsx('sm:ms-auto', table.getPageCount() === 0 && 'hidden')}
        />
      </div>
    </Card>
  );
}
