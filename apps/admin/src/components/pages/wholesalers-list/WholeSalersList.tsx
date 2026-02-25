import { useCallback, useMemo, useRef, useState } from 'react';
import { flexRender, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import { Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { ChevronsUpDown, Plus, Search } from 'lucide-react';

import { useActiveRolesQuery } from '@/lib/queries/roles';
import {
  useBulkUpdateWholesalersRoleMutation,
  useTotalCountQuery,
  useWholesalersQuery,
} from '@/lib/queries/wholesalers';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BulkActionBox, BulkActionCloseButton } from '@/components/ui/bulk-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WholeSaleToolTip } from '@/components/custom/WholeSaleToolTip';
import RolesIcon from '@/components/icons/RolesIcon';

import { WholesalersColumn } from './wholesalers-table/WholesalersColumn';

export default function WholeSalersList() {
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [roleFilter, setRoleFilter] = useState('all');

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSearch = useCallback((value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setKeyword(value);
    }, 500);
  }, []);

  const {
    data: wholesalersData,
    isLoading: isLoadingWholesalers,
    isFetching: isFetchingWholesalers,
  } = useWholesalersQuery(keyword, pagination, roleFilter);

  const { data: activeRoles } = useActiveRolesQuery();
  const { data: totalCount } = useTotalCountQuery();

  const table = useReactTable({
    data: wholesalersData?.data ?? [],
    columns: WholesalersColumn,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: wholesalersData?.totalItems ?? 0,
    pageCount: wholesalersData?.totalPage ?? -1,
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const selectedRowsIds = useMemo(
    () => Array.from(table.getSelectedRowModel().rows, (row) => row.original.id),
    [selectedCount],
  );

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    table.setPageIndex(0);
    debouncedSearch(e.target.value);
  };

  const handleChangePerPage = async (value: string) => {
    table.setPageSize(parseInt(value));
    table.setPageIndex(0);
  };

  const { mutate: bulkUpdateWholesalersRole, isPending: isBulkUpdateWholesalersPending } =
    useBulkUpdateWholesalersRoleMutation(selectedRowsIds);

  const onFilterChanged = (value: string) => {
    setRoleFilter(value);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  return (
    <Card className="gap-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{__('Wholesalers List', 'yay-wholesale-b2b')}</h1>
          {totalCount && totalCount.count > 0 && (
            <WholeSaleToolTip
              trigger={
                <div>
                  <Badge variant="secondary" className="h-5 min-w-5 px-1 tabular-nums">
                    {totalCount.count}
                  </Badge>
                </div>
              }
              content={
                totalCount.count > 1
                  ? sprintf(__('%d wholesalers in total', 'yay-wholesale-b2b'), totalCount.count)
                  : __('1 wholesaler in total', 'yay-wholesale-b2b')
              }
              side="bottom"
            />
          )}
        </div>
        <div className="flex flex-col-reverse items-end gap-4 lg:flex-row">
          {(table.getPageCount() > 1 || keyword !== '') && (
            <InputGroup className="w-full sm:w-80">
              <InputGroupInput
                placeholder="Search by ID, Email, Display Name"
                value={search}
                onChange={handleChangeSearch}
              />
              <InputGroupAddon align="inline-end">
                <Search className="size-4.5 text-[#A0A0A7]" />
              </InputGroupAddon>
            </InputGroup>
          )}
          <Select value={roleFilter} onValueChange={(value) => onFilterChanged(value)}>
            <SelectTrigger className="w-45.5">
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
          <a
            href={window.yayWholesaleB2BAdmin.user_urls.add_new}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="primary-outline"
              className="hover:bg-primary hover:text-primary-foreground gap-0.25 rounded-sm px-4 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span className="px-0.75 text-[12px] text-nowrap sm:text-[14px]">
                {__('Add New Wholesaler', 'yay-wholesale-b2b')}
              </span>
            </Button>
          </a>
        </div>
      </div>

      {/* Table */}
      <div
        className={cn(
          'overflow-x-auto rounded-lg border',
          isBulkUpdateWholesalersPending && 'relative opacity-50',
        )}
      >
        {/* Overlay Spinner */}
        {isBulkUpdateWholesalersPending && (
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
                      'text-foreground-400 py-2 text-sm font-medium',
                      header.column.columnDef.meta?.align === 'center'
                        ? 'text-center'
                        : 'text-left',
                      header.column.columnDef.meta?.isCheckbox ? 'w-[36px] p-0!' : 'px-3',
                    )}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoadingWholesalers ? (
              <TableRow>
                <TableCell
                  colSpan={WholesalersColumn.length}
                  className="h-32 text-center align-middle"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="text-muted-foreground size-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
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
                        cell.column.columnDef.meta?.align === 'center'
                          ? 'text-center'
                          : 'text-left',
                        cell.column.columnDef.meta?.isCheckbox ? 'w-[36px] p-0!' : 'px-3',
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={WholesalersColumn.length} className="h-24 text-center">
                  {__('No Wholesalers found.', 'yay-wholesale-b2b')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Footer */}
      {(table.getPageCount() > 1 || selectedCount > 1) && (
        <div
          className={cn(
            'relative flex flex-col items-center gap-3 sm:flex-row',
            selectedCount > 1 ? 'justify-between' : 'justify-end',
          )}
        >
          <BulkActionBox visible={selectedCount > 1}>
            <BulkActionCloseButton onClick={() => table.resetRowSelection()} />
            <span className="text-foreground text-sm font-normal">
              {sprintf(__('%d selected', 'yay-wholesale-b2b'), selectedCount)}
            </span>
            <Separator orientation="vertical" className="ml-2 h-5!" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hover:text-primary hover:bg-primary/6 group flex gap-1.5 px-2.5"
                >
                  <span className="text-sm font-normal">
                    {__('Wholesaler Role', 'yay-wholesale-b2b')}
                  </span>
                  <span className="group-hover:text-primary text-muted-foreground flex items-center">
                    <ChevronsUpDown className="size-3.5 stroke-[2.5px]" />
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" sideOffset={9} className="w-fit min-w-[20px] p-1">
                {activeRoles?.map((role) => (
                  <DropdownMenuItem
                    onClick={() => {
                      if (isBulkUpdateWholesalersPending || isFetchingWholesalers) return;
                      bulkUpdateWholesalersRole(
                        { roleSlug: role.slug },
                        {
                          onSuccess: () => {
                            table.resetRowSelection();
                          },
                        },
                      );
                    }}
                  >
                    <RolesIcon role={role?.slug} className="mt-0.5 min-h-4 min-w-4" /> {role.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </BulkActionBox>

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
