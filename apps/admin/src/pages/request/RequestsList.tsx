import { useCallback, useMemo, useRef, useState } from 'react';
import { flexRender, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import { ChevronsUpDown, Search } from 'lucide-react';
import { Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import {
  useBulkDeleteRequestMutation,
  useBulkUpdateRequestStatusMutation,
  useRequestsQuery,
  useTotalCountQuery,
} from '@/lib/queries/requests';
import { useActiveRolesQuery } from '@/lib/queries/roles';
import { RequestFormValues } from '@/lib/schema/requests';
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
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WholeSaleToolTip } from '@/components/custom/WholeSaleToolTip';
import DeleteIcon from '@/components/icons/DeleteIcon';
import RequestsStatusIcon from '@/components/icons/RequestStatusIcon';
import { RequestsColumn } from './requests-table/RequestsColumn';
import requestsStatusMap from './requests-table/RequestsStatusMap';

export default function RequestsList() {
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openBulkDeleteDialog, setOpenDeleteDialog] = useState(false);
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
    data: requests,
    isLoading: isLoadingRequests,
    isFetching: isFetchingRequests,
  } = useRequestsQuery(keyword, pagination, statusFilter);

  const { data: activeRoles } = useActiveRolesQuery();
  const { data: totalCount } = useTotalCountQuery();

  const columns = RequestsColumn;
  const defaultData = useMemo(() => [], []);

  const table = useReactTable({
    data: requests?.data ?? defaultData,
    columns,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: requests?.totalPage ?? 0,
    rowCount: requests?.data.length ?? 0,
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const selectedRowsIds = useMemo(
    () => Array.from(table.getSelectedRowModel().rows, (row) => row.original.id),
    [selectedCount],
  );
  const bulkUpdateMutation = useBulkUpdateRequestStatusMutation(selectedRowsIds);
  const bulkDeleteMutation = useBulkDeleteRequestMutation(selectedRowsIds);

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    table.setPageIndex(0);
    debouncedSearch(e.target.value);
  };

  const handleChangePerPage = async (value: string) => {
    table.setPageSize(parseInt(value));
    table.setPageIndex(0);
  };

  const handleBulkStatusChange = async (status: RequestFormValues['status'], roleId?: number) => {
    if (bulkUpdateMutation.isPending || bulkDeleteMutation.isPending || isFetchingRequests) {
      return;
    }
    if (!roleId) {
      roleId = -1;
    }
    await bulkUpdateMutation.mutateAsync({ status, roleId });
    table.resetRowSelection();
  };

  const handleBulkDelete = async () => {
    if (bulkUpdateMutation.isPending || bulkDeleteMutation.isPending || isFetchingRequests) {
      return;
    }
    await bulkDeleteMutation.mutateAsync();
    setOpenDeleteDialog(false);
    table.resetRowSelection();
  };

  const onFilterChanged = (value: string) => {
    setStatusFilter(value);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  return (
    <Card className="gap-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{__('Wholesaler Requests', 'yay-wholesale-b2b')}</h1>
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
                  ? sprintf(__('%d requests in total', 'yay-wholesale-b2b'), totalCount.count)
                  : __('1 request in total', 'yay-wholesale-b2b')
              }
              side="bottom"
            />
          )}
        </div>
        <div className="flex flex-col items-end gap-4 md:flex-row">
          <Select value={statusFilter} onValueChange={(value) => onFilterChanged(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{__('Status Filter', 'yay-wholesale-b2b')}</SelectLabel>
                <SelectItem value="all">{__('All status', 'yay-wholesale-b2b')}</SelectItem>
                {Object.entries(requestsStatusMap).map((status) => {
                  const { icon, text } = status[1];
                  return (
                    status[0] !== 'approved' && (
                      <SelectItem value={status[0]}>
                        {icon} {text}
                      </SelectItem>
                    )
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
          {(table.getPageCount() > 1 || keyword !== '') && (
            <InputGroup className="w-full md:w-76">
              <InputGroupInput placeholder="Search" value={search} onChange={handleChangeSearch} />
              <InputGroupAddon align="inline-end">
                <Search className="size-4.5 text-[#A0A0A7]" />
              </InputGroupAddon>
            </InputGroup>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className={cn(
          'relative overflow-x-auto rounded-lg border',
          (bulkUpdateMutation.isPending || bulkDeleteMutation.isPending) && 'relative opacity-50',
        )}
      >
        {/* Overlay Spinner */}
        {(bulkUpdateMutation.isPending || bulkDeleteMutation.isPending) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <Spinner className="text-muted-foreground size-6 animate-spin" />
          </div>
        )}
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
            {isLoadingRequests ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center align-middle">
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
                  className="group not-last:border-divider not-last:border-b"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn('h-14', cell.column.id === 'actions' ? 'flex w-25 justify-end lg:w-full' : '')}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {__('No requests found.', 'yay-wholesale-b2b')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Footer */}
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
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger
                    className="w-35"
                    onClick={() => {
                      handleBulkStatusChange('approved');
                    }}
                  >
                    <RequestsStatusIcon status="approved" className="mt-0.5" />
                    {__('Approve', 'yay-wholesale-b2b')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {activeRoles?.map((role) => (
                      <DropdownMenuItem
                        onClick={() => {
                          handleBulkStatusChange('approved', role.id);
                        }}
                        className="hover:bg-muted flex w-full cursor-pointer items-center justify-start gap-2 rounded-sm px-2.5 py-2 text-sm"
                      >
                        <RequestsStatusIcon status="approved" className="mt-0.5" />
                        {sprintf(__('Approve to %s', 'yay-wholesale-b2b'), role.name)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem className="w-35" onClick={() => handleBulkStatusChange('rejected')}>
                  <RequestsStatusIcon status="rejected" />
                  {__('Reject', 'yay-wholesale-b2b')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation="vertical" className="h-5!" />
            <Dialog open={openBulkDeleteDialog} onOpenChange={setOpenDeleteDialog}>
              <WholeSaleToolTip
                trigger={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:text-destructive text-muted-foreground h-8 w-8 hover:bg-transparent hover:shadow-sm"
                    onClick={() => setOpenDeleteDialog(true)}
                  >
                    <DeleteIcon className="size-4" />
                  </Button>
                }
                content={<span>{__('Delete', 'yay-wholesale-b2b')}</span>}
              />
              <DialogContent className="bw:max-w-md">
                <DialogHeader className="bw:border-b-0">
                  <DialogTitle>
                    {sprintf(__(`Are you sure you want to delete %d requests ?`, 'yay-wholesale-b2b'), selectedCount)}
                  </DialogTitle>
                  <DialogDescription>
                    {__(
                      'This action cannot be undone. This will permanently delete these requests and remove data from servers',
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
