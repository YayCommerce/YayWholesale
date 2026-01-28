import { useCallback, useMemo, useRef, useState } from 'react';
import { CaretUpDownIcon } from '@phosphor-icons/react';
import { flexRender, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import { Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Search } from 'lucide-react';

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
import {
  BulkActionBox,
  BulkActionButton,
  BulkActionMenu,
  BulkActionMenuContent,
  BulkMenuButtonAndTrigger,
} from '@/components/ui/bulk-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortalContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Pagination } from '@/components/ui/pagination';
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
    data,
    isLoading: isLoadingRequests,
    isFetching: isFetchingRequests,
  } = useRequestsQuery(keyword, pagination, statusFilter);

  const { data: activeRoles } = useActiveRolesQuery();
  const { data: totalCount } = useTotalCountQuery();

  const columns = RequestsColumn;
  const defaultData = useMemo(() => [], []);

  const table = useReactTable({
    data: data?.data ?? defaultData,
    columns,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: data?.totalPage ?? 0,
    rowCount: data?.data.length ?? 0,
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const selectedRowsIds = useMemo(
    () => Array.from(table.getSelectedRowModel().rows, (row) => row.original.id),
    [selectedCount],
  );
  const useBulkUpdateMutation = useBulkUpdateRequestStatusMutation(selectedRowsIds);
  const useBulkDeleteMutation = useBulkDeleteRequestMutation(selectedRowsIds);

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
    if (!roleId) {
      roleId = -1;
    }
    await useBulkUpdateMutation.mutateAsync({ status, roleId });
    table.resetRowSelection();
  };

  const handleBulkDelete = async () => {
    await useBulkDeleteMutation.mutateAsync();
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
                  <Badge
                    variant="muted"
                    className="text-foreground h-5 min-w-5 rounded-full border-none px-1 tabular-nums"
                  >
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
          (useBulkUpdateMutation.isPending || useBulkDeleteMutation.isPending) &&
            'relative opacity-50',
        )}
      >
        {/* Overlay Spinner */}
        {(useBulkUpdateMutation.isPending || useBulkDeleteMutation.isPending) && (
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
                      header.column.columnDef.meta?.isCheckbox ? 'w-[36px] p-0' : 'px-3',
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
                      className={cn(
                        'h-14',
                        cell.column.id === 'select' ? 'p-0' : '',
                        cell.column.id === 'actions' ? 'flex w-25 justify-end lg:w-full' : '',
                      )}
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
        <div
          className={cn(
            'relative flex flex-col items-center gap-3 sm:flex-row',
            selectedCount > 1 &&
              !(useBulkUpdateMutation.isPending || useBulkDeleteMutation.isPending)
              ? 'justify-between'
              : 'justify-end',
          )}
        >
          {!(useBulkUpdateMutation.isPending || useBulkDeleteMutation.isPending) && (
            <BulkActionBox selected={selectedCount} onClose={() => table.resetRowSelection()}>
              <span className="text-foreground text-sm font-normal">
                {sprintf(__('%d selected', 'yay-wholesale-b2b'), selectedCount)}
              </span>
              <Separator orientation="vertical" className="ml-2 h-5!" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hover:text-primary hover:bg-primary/6 group flex gap-1.5 px-2.5"
                  >
                    <span className="text-sm font-normal">{__('Status', 'yay-wholesale-b2b')}</span>
                    <span className="group-hover:text-primary text-icon flex items-center">
                      <CaretUpDownIcon size={12} weight="bold" />
                    </span>
                  </Button>
                </PopoverTrigger>

                <PopoverContent align="start" sideOffset={9} className="w-fit min-w-[20px] p-1">
                  <div className="flex flex-col">
                    <BulkActionMenu>
                      <BulkMenuButtonAndTrigger onClick={() => handleBulkStatusChange('approved')}>
                        <RequestsStatusIcon status="approved" className="mt-0.5" />
                        {__('Approve', 'yay-wholesale-b2b')}
                      </BulkMenuButtonAndTrigger>
                      <BulkActionMenuContent>
                        {activeRoles?.map((role) => (
                          <BulkActionButton
                            onClick={() => handleBulkStatusChange('approved', role.id)}
                          >
                            <RequestsStatusIcon status="approved" />
                            {sprintf(__('Approve to %s', 'yay-wholesale-b2b'), role.name)}
                          </BulkActionButton>
                        ))}
                      </BulkActionMenuContent>
                    </BulkActionMenu>

                    <BulkActionButton onClick={() => handleBulkStatusChange('rejected')}>
                      <RequestsStatusIcon status="rejected" />
                      {__('Reject', 'yay-wholesale-b2b')}
                    </BulkActionButton>
                  </div>
                </PopoverContent>
              </Popover>
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
                <DialogPortalContent className="bw:max-w-md">
                  <DialogHeader className="bw:border-b-0">
                    <DialogTitle>
                      {sprintf(
                        __(`Are you sure you want to delete %d requests ?`, 'yay-wholesale-b2b'),
                        selectedCount,
                      )}
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
                </DialogPortalContent>
              </Dialog>
            </BulkActionBox>
          )}

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
