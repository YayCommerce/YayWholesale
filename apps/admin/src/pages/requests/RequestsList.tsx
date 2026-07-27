import { useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import clsx from 'clsx';
import { ChevronsUpDown, Loader2, Search } from 'lucide-react';
import { useDebounce } from 'rooks';
import { __, _n, sprintf } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import {
  useBulkApproveRequestMutation,
  useBulkDeleteRequestMutation,
  useBulkRejectRequestMutation,
  useCountByStatusQuery,
  useIsMutatingRequests,
  useRequestsQuery,
} from '@/lib/queries/requests.queries';
import { useActiveRolesQuery, useDefaultRole } from '@/lib/queries/roles.queries';
import { RequestFilter } from '@/lib/schema/requests.type';
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
import { toast } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DeleteIcon from '@/components/icons/DeleteIcon';
import RequestsStatusIcon from '@/components/icons/RequestsStatusIcon';
import { requestColumns } from './RequestsList/RequestColumns';

export default function RequestsList() {
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = useState<RequestFilter['status']>('all');
  const setSearchDebounced = useDebounce(setSearch, 500);

  const [openBulkDeleteDialog, setOpenDeleteDialog] = useState(false);
  const { data: countByStatusRes } = useCountByStatusQuery();
  const totalCount = countByStatusRes?.total;

  const filter = useMemo(
    () =>
      ({
        search,
        status: statusFilter,
        page: pagination.pageIndex + 1,
        perPage: pagination.pageSize,
      }) satisfies RequestFilter,
    [search, pagination, statusFilter],
  );

  const { data: requestsPage, isLoading } = useRequestsQuery(filter);
  const { data: activeRoles } = useActiveRolesQuery();
  const defaultRole = useDefaultRole();

  const defaultData = useMemo(() => [], []);
  const table = useReactTable({
    data: requestsPage?.data ?? defaultData,
    columns: requestColumns,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: requestsPage?.totalItems ?? 0,
    pageCount: requestsPage?.totalPage ?? -1,
  });

  const bulkApproveMutation = useBulkApproveRequestMutation();
  const bulkRejectMutation = useBulkRejectRequestMutation();
  const bulkDeleteMutation = useBulkDeleteRequestMutation();
  const isMutating = useIsMutatingRequests();

  async function handleBulkApprove(roleSlug: string) {
    const requestIds = table.getSelectedRowModel().rows.map((row) => row.original.id);
    if (requestIds.length === 0 || isMutating > 0) return;

    try {
      await bulkApproveMutation.mutateAsync({
        roleSlug,
        requestIds,
      });
      table.resetRowSelection();
      toast.success(sprintf(__('Approved %d requests successfully', 'yay-wholesale-b2b'), requestIds.length));
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  async function handleBulkReject() {
    const requestIds = table.getSelectedRowModel().rows.map((row) => row.original.id);
    if (requestIds.length === 0 || isMutating > 0) return;

    try {
      await bulkRejectMutation.mutateAsync(requestIds);
      table.resetRowSelection();
      toast.success(sprintf(__('Rejected %d requests successfully', 'yay-wholesale-b2b'), requestIds.length));
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  async function handleBulkDelete() {
    const requestIds = table.getSelectedRowModel().rows.map((row) => row.original.id);
    if (requestIds.length === 0 || isMutating > 0) return;

    try {
      await bulkDeleteMutation.mutateAsync(requestIds);
      setOpenDeleteDialog(false);
      table.resetRowSelection();
      toast.success(sprintf(__('Deleted %d requests successfully', 'yay-wholesale-b2b'), requestIds.length));
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  const selectedCount = table.getSelectedRowModel().rows.length;
  const noRequest = totalCount === 0;
  const noFilteredRequest = !isLoading && requestsPage?.data.length === 0;

  return (
    <Card className="gap-4 p-4 shadow-sm md:p-5 2xl:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex w-fit items-center gap-2 overflow-visible sm:w-1 md:w-fit">
          <h1 className="text-2xl font-bold text-nowrap">{__('Wholesaler Requests', 'yay-wholesale-b2b')}</h1>
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
                _n('%d request in total', '%d requests in total', totalCount, 'yay-wholesale-b2b'),
                totalCount,
              )}
              side="bottom"
            />
          )}
        </div>

        <div className="flex w-full flex-col items-end justify-end gap-4 sm:flex-row xl:w-fit">
          <InputGroup className="w-full md:w-76">
            <InputGroupInput
              placeholder="Search by Email, Display Name"
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
            value={statusFilter}
            onValueChange={(status: RequestFilter['status']) => {
              table.setPageIndex(0);
              setStatusFilter(status);
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{__('Status Filter', 'yay-wholesale-b2b')}</SelectLabel>
                <SelectItem value="all">{__('All status', 'yay-wholesale-b2b')}</SelectItem>
                <SelectItem value="pending">
                  <RequestsStatusIcon status="pending" />
                  {__('Pending', 'yay-wholesale-b2b')}
                </SelectItem>
                <SelectItem value="rejected">
                  <RequestsStatusIcon status="rejected" />
                  {__('Rejected', 'yay-wholesale-b2b')}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto rounded-lg border">
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
            {(noRequest || noFilteredRequest) && (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-32 text-center">
                  {__('No Requests found.', 'yay-wholesale-b2b')}
                </TableCell>
              </TableRow>
            )}

            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="group not-last:border-divider not-last:border-b"
                onClick={(e) => e.currentTarget.classList.toggle('is-row-pressed')}
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
                  <ChevronsUpDown className="size-3.5 stroke-[2.5px]" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={9} className="w-fit min-w-5 p-1">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  className="w-35"
                  onClick={() => {
                    if (!defaultRole) return;
                    handleBulkApprove(defaultRole.slug);
                  }}
                >
                  <RequestsStatusIcon status="approved" className="mt-0.5" />
                  {__('Approve', 'yay-wholesale-b2b')}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {activeRoles?.map((role) => (
                    <DropdownMenuItem
                      key={role.slug}
                      onClick={() => {
                        handleBulkApprove(role.slug);
                      }}
                      className="hover:bg-muted flex w-full cursor-pointer items-center justify-start gap-2 rounded-sm px-2.5 py-2 text-sm"
                    >
                      <RequestsStatusIcon status="approved" className="mt-0.5" />
                      {sprintf(__('Approve to %s', 'yay-wholesale-b2b'), role.name)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem className="w-35" onClick={() => handleBulkReject()}>
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
                  className="hover:text-destructive text-muted-foreground size-8 hover:bg-transparent hover:shadow-sm"
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
                  {bulkDeleteMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
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
