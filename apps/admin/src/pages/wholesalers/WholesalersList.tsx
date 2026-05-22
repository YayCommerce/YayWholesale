import { useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import clsx from 'clsx';
import { ChevronsUpDown, Loader2, Plus, Search } from 'lucide-react';
import { useDebounce } from 'rooks';
import { __, _n, sprintf } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useActiveRolesQuery, useUserCountByRolesQuery } from '@/lib/queries/roles.queries';
import {
  useBulkUpdateWholesalersRoleMutation,
  useIsMutatingWholesalers,
  useWholesalersQuery,
} from '@/lib/queries/wholesalers.queries';
import { WholesalerFilter } from '@/lib/schema/wholesalers.type';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BulkActionBox } from '@/components/ui/bulk-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Pagination } from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import RolesIcon from '@/components/icons/RolesIcon';
import { wholesalerColumns } from './WholesalersList/WholesalerColumns';

export function WholesalersList() {
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [roleFilter, setRoleFilter] = useState('all');
  const setSearchDebounced = useDebounce(setSearch, 500);

  const { data: userCount } = useUserCountByRolesQuery();
  const totalCount = useMemo(() => {
    if (!userCount) return undefined;
    return Object.values(userCount).reduce((acc, count) => acc + count, 0);
  }, [userCount]);

  const filter = useMemo(
    () =>
      ({
        search,
        ...(roleFilter === 'all' ? {} : { roleSlug: roleFilter }),
        page: pagination.pageIndex + 1,
        perPage: pagination.pageSize,
      }) satisfies WholesalerFilter,
    [search, pagination, roleFilter],
  );

  const { data: wholesalersPage, isLoading } = useWholesalersQuery(filter);
  const { data: activeRoles } = useActiveRolesQuery();

  const defaultData = useMemo(() => [], []);
  const table = useReactTable({
    data: wholesalersPage?.data ?? defaultData,
    columns: wholesalerColumns,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: wholesalersPage?.totalItems ?? 0,
    pageCount: wholesalersPage?.totalPage ?? -1,
  });

  const bulkUpdateWholesalersRoleMutation = useBulkUpdateWholesalersRoleMutation();
  const isMutating = useIsMutatingWholesalers();

  async function handleBulkUpdateWholesalersRole(roleSlug: string) {
    const userIds = table.getSelectedRowModel().rows.map((row) => row.original.id);
    if (userIds.length === 0 || isMutating > 0) return;

    try {
      table.resetRowSelection();
      await bulkUpdateWholesalersRoleMutation.mutateAsync({
        userIds,
        roleSlug,
      });
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  const selectedCount = table.getSelectedRowModel().rows.length;
  const noWholesaler = totalCount === 0;
  const noFilterData = !isLoading && wholesalersPage?.data?.length === 0;

  return (
    <Card className="gap-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{__('Wholesalers List', 'yay-wholesale-b2b')}</h1>
          {totalCount !== undefined && (
            <WholeSaleToolTip
              trigger={
                <div>
                  <Badge variant="secondary" className="h-5 min-w-5 px-1 tabular-nums">
                    {totalCount}
                  </Badge>
                </div>
              }
              content={sprintf(
                _n('%d wholesaler in total', '%d wholesalers in total', totalCount, 'yay-wholesale-b2b'),
                totalCount,
              )}
              side="bottom"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col-reverse items-end gap-4 lg:flex-0 lg:flex-row">
          <InputGroup className="w-full sm:w-80">
            <InputGroupInput
              placeholder="Search by ID, Email, Display Name"
              defaultValue={search}
              onChange={(e) => {
                table.setPageIndex(0);
                setSearchDebounced(e.target.value);
              }}
            />
            <InputGroupAddon align="inline-end">
              <Search className="size-4.5 text-[#A0A0A7]" />
            </InputGroupAddon>
          </InputGroup>
          <Select
            value={roleFilter}
            onValueChange={(roleSlug) => {
              table.setPageIndex(0);
              setRoleFilter(roleSlug);
            }}
          >
            <SelectTrigger className="w-full sm:w-45.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{__('Wholesaler Role Filter', 'yay-wholesale-b2b')}</SelectLabel>
                <SelectItem value="all">{__('All Roles', 'yay-wholesale-b2b')}</SelectItem>
                {activeRoles?.map((role) => {
                  return (
                    <SelectItem key={role.id} value={role.slug}>
                      {role.name}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="primary-outline-fill" asChild>
            <a href={window.yayWholesaleB2BMeta.wpMeta.usersUrl.new} target="_blank" rel="noopener noreferrer">
              <Plus className="size-4" />
              {__('Add New Wholesaler', 'yay-wholesale-b2b')}
            </a>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <Table className="min-w-full">
          <TableHeader className="text-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-divider border-b">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'text-foreground-400 py-2 text-sm font-medium',
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
            {noWholesaler && (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-32 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    {__('Add your first wholesaler to get started.', 'yay-wholesale-b2b')}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!noWholesaler && noFilterData && (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-32 text-center">
                  {__('No Wholesalers found.', 'yay-wholesale-b2b')}
                </TableCell>
              </TableRow>
            )}

            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="not-last:border-divider not-last:border-b"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      'h-14',
                      cell.column.columnDef.meta?.align === 'center' ? 'text-center' : 'text-left',
                      cell.column.columnDef.meta?.isCheckbox ? 'w-9' : 'px-3',
                    )}
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
                <span className="text-sm font-normal">{__('Wholesaler Role', 'yay-wholesale-b2b')}</span>
                <span className="group-hover:text-primary text-muted-foreground flex items-center">
                  <ChevronsUpDown className="size-3.5 stroke-[2.5px]" />
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" sideOffset={9} className="w-fit min-w-[20px] p-1">
              {activeRoles?.map((role) => {
                const isUpdating =
                  bulkUpdateWholesalersRoleMutation.isPending &&
                  bulkUpdateWholesalersRoleMutation.variables?.roleSlug === role.slug;
                return (
                  <DropdownMenuItem key={role.slug} onClick={() => handleBulkUpdateWholesalersRole(role.slug)}>
                    {isUpdating && <Loader2 className="size-3.5 animate-spin" />}
                    {!isUpdating && <RolesIcon role={role?.slug} className="size-4" />}
                    {role.name}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
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
