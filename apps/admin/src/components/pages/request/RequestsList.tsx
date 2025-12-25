import { useMemo, useState } from 'react';
import { CaretUpDownIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import { Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { debounce } from 'lodash';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

import {
  useBulkDeleteRequestMutation,
  useBulkUpdateRequestStatusMutation,
  useRequestsQuery,
} from '@/lib/queries/requests';
import { useActiveRolesQuery } from '@/lib/queries/roles';
import { RequestFormValues } from '@/lib/schema/requests';
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
import {
  BulkActionButton,
  BulkActionMenu,
  BulkActionMenuContent,
  BulkMenuButtonAndTrigger,
} from '@/components/ui/bulk-actions';
import BulkActionBox from '@/components/ui/bulk-actions-box';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { InputNumberInput, InputNumberRoot } from '@/components/ui/input-number';
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
  const clientQuery = useQueryClient();

  const debouncedSearch = useMemo(() => {
    return debounce((value) => {
      setKeyword(value);
    }, 500);
  }, [clientQuery]);

  const {
    data,
    isLoading: isLoadingRequests,
    isFetching: isFetchingRequests,
  } = useRequestsQuery(keyword, pagination, statusFilter);

  const { data: activeRoles } = useActiveRolesQuery();

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
    table.resetRowSelection();
  };

  return (
    <Card className="gap-4 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{__('Wholesaler Requests', 'yay-wholesale')}</h1>
        <div className="flex flex-col items-end gap-4 md:flex-row">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{__('Status Filter', 'yay-wholesale')}</SelectLabel>
                <SelectItem value="all">{__('All status', 'yay-wholesale')}</SelectItem>
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
                  className="group"
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
                  {__('No requests found.', 'yay-wholesale')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Footer */}
      {data != undefined && data.data.length > 0 && (
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
                    <span className="text-sm font-normal">{__('Status')}</span>
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
                        {__('Approve')}
                      </BulkMenuButtonAndTrigger>
                      <BulkActionMenuContent>
                        {activeRoles?.map((role) => (
                          <BulkActionButton
                            onClick={() => handleBulkStatusChange('approved', role.id)}
                          >
                            <RequestsStatusIcon status="approved" />
                            {sprintf(__('Approve to %s'), role.name)}
                          </BulkActionButton>
                        ))}
                      </BulkActionMenuContent>
                    </BulkActionMenu>

                    <BulkActionButton onClick={() => handleBulkStatusChange('rejected')}>
                      <RequestsStatusIcon status="rejected" />
                      {__('Reject')}
                    </BulkActionButton>
                  </div>
                </PopoverContent>
              </Popover>
              <Separator orientation="vertical" className="h-5!" />
              <AlertDialog open={openBulkDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <WholeSaleToolTip
                  trigger={
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:text-destructive text-base-muted-foreground h-8 w-8 hover:bg-transparent hover:shadow-sm"
                      onClick={() => setOpenDeleteDialog(true)}
                    >
                      <DeleteIcon className="size-4" />
                    </Button>
                  }
                  content={<span>{__('Delete', 'yay-wholesale')}</span>}
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {sprintf(
                        __(`Are you sure you want to delete %d requests ?`, 'yay-wholesale'),
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
          )}

          <div className="flex items-center gap-4">
            <span className="text-base-secondary text-sm font-normal">
              {sprintf(
                __('Page %d of %d'),
                table.getState().pagination.pageIndex + 1,
                table.getPageCount(),
              )}
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
              <InputNumberRoot
                min={1}
                max={table.getPageCount()}
                value={table.getState().pagination.pageIndex + 1}
                onValueChange={(value) => {
                  if (isFetchingRequests) return;
                  const page = value ? Number(value) - 1 : 0;
                  if (page >= 0 && page < table.getPageCount()) {
                    table.setPageIndex(page);
                  }
                }}
                className="text-base-secondary h-9 w-15 rounded-sm text-sm font-normal focus-visible:ring-0"
                disabled={isFetchingRequests || table.getPageCount() <= 1}
              >
                <InputNumberInput className="disabled:bg-base-muted w-full shadow-xs disabled:text-black" />
              </InputNumberRoot>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
