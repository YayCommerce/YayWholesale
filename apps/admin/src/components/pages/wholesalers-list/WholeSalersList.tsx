import { useMemo, useState } from 'react';
import { CaretUpDownIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import { Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { debounce } from 'lodash';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Plus, Search } from 'lucide-react';

import { useActiveRolesQuery } from '@/lib/queries/roles';
import {
  useBulkUpdateWholesalersRoleMutation,
  useWholesalersQuery,
} from '@/lib/queries/wholesalers';
import { cn } from '@/lib/utils';
import { BulkActionButton } from '@/components/ui/bulk-actions';
import BulkActionBox from '@/components/ui/bulk-actions-box';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

  const clientQuery = useQueryClient();
  const debouncedSearch = useMemo(() => {
    return debounce((value) => {
      setKeyword(value);
    }, 500);
  }, [clientQuery]);

  const {
    data: wholesalersData,
    isLoading: isLoadingWholesalers,
    isFetching: isFetchingWholesalers,
  } = useWholesalersQuery(keyword, pagination, roleFilter);

  const { data: activeRoles } = useActiveRolesQuery();

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

  return (
    <Card className="gap-4 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{__('Wholesalers List', 'yay-wholesale')}</h1>
        <div className="flex flex-col-reverse items-end gap-2 lg:flex-row">
          {wholesalersData && wholesalersData.data.length > 10 && (
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
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-45.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{__('Wholesaler Role Filter', 'yay-wholesale')}</SelectLabel>
                <SelectItem value="all">{__('All Roles', 'yay-wholesale')}</SelectItem>
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
          <a href={window.yayWholesale.user_urls.add_new} target="_blank" rel="noopener noreferrer">
            <Button
              variant="primary-outline"
              className="hover:bg-primary/10 h-[34px] gap-2 rounded-sm px-4 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span className="text-[12px] text-nowrap sm:text-[14px]">
                {__('Add New Wholesaler')}
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'h-14',
                        cell.column.columnDef.meta?.align === 'center'
                          ? 'text-center'
                          : 'text-left',
                        cell.column.columnDef.meta?.isCheckbox ? 'w-[36px] p-0' : 'px-3',
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
                  {__('No Wholesalers found.', 'yay-wholesale')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Footer */}
      {wholesalersData != undefined && wholesalersData?.data?.length > 0 && (
        <div
          className={cn(
            'relative flex flex-col items-center gap-3 sm:flex-row',
            selectedCount > 1 && !isBulkUpdateWholesalersPending
              ? 'justify-between'
              : 'justify-end',
          )}
        >
          {!isBulkUpdateWholesalersPending && (
            <BulkActionBox selected={selectedCount} onClose={() => table.resetRowSelection()}>
              <span className="text-sm font-normal text-[#151619]">
                {sprintf(__('%d selected'), selectedCount)}
              </span>
              <Separator orientation="vertical" className="ml-2 h-5!" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hover:text-primary hover:bg-primary/6 group bold flex cursor-pointer items-center gap-1.5 px-2.5"
                  >
                    <span className="text-sm font-normal">{__('Wholesaler Role')}</span>
                    <span className="group-hover:text-primary text-icon flex items-center">
                      <CaretUpDownIcon size={12} weight="bold" />
                    </span>
                  </Button>
                </PopoverTrigger>

                <PopoverContent align="start" sideOffset={9} className="w-fit min-w-[20px] p-1">
                  <div className="flex flex-col">
                    {activeRoles?.map((role) => (
                      <BulkActionButton
                        onClick={() =>
                          bulkUpdateWholesalersRole(
                            { roleSlug: role.slug },
                            {
                              onSuccess: () => {
                                table.resetRowSelection();
                              },
                            },
                          )
                        }
                      >
                        <RolesIcon role={role?.slug} className="mt-0.5 min-h-4 min-w-4" />{' '}
                        {role.name}
                      </BulkActionButton>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </BulkActionBox>
          )}

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
