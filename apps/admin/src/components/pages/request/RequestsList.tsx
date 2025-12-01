import { useMemo, useState } from 'react';
import { CaretUpDownIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { debounce } from 'lodash';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Trash2,
} from 'lucide-react';

import {
  useBulkDeleteRequestMutation,
  useBulkUpdateRequestStatusMutation,
  useRequestsQuery,
} from '@/lib/queries/requests';
import { useActiveRolesQuery } from '@/lib/queries/roles';
import { RequestFormValues } from '@/lib/schema/requests';
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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ActionButton,
  ActionMenuButton,
  SelectActionButton,
} from '@/components/ui/select-action-button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TableToast,
  TableToastClose,
  TableToaster,
  TableToastTitle,
} from '@/components/ui/table-toast';
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
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{__('Status Filter', 'yay-wholesale')}</SelectLabel>
                <SelectItem value="all">{__('All', 'yay-wholesale')}</SelectItem>
                {Object.entries(requestsStatusMap).map((status) => {
                  const { icon, text } = status[1];
                  return (
                    <SelectItem value={status[0]}>
                      {icon} {text}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
          <InputGroup className="w-60">
            <InputGroupInput placeholder="Search" value={search} onChange={handleChangeSearch} />
            <InputGroupAddon align="inline-end">
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Spinner className="text-muted-foreground size-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
        <div className="relative flex flex-col items-center justify-end gap-3 sm:flex-row">
          <TableToaster className="left-2/3 md:left-2/7">
            <TableToast
              open={selectedCount > 0}
              onOpenChange={(open) => {
                if (!open) {
                  table.resetRowSelection();
                }
              }}
            >
              <TableToastClose onClick={() => table.resetRowSelection()} />
              <TableToastTitle>
                {__('%RC% selected').replace('%RC%', selectedCount.toString())}
              </TableToastTitle>
              <Separator orientation="vertical" className="ml-2 h-5!" />
              <SelectActionButton title="Status" icon={<CaretUpDownIcon size={12} weight="bold" />}>
                <ActionMenuButton
                  icon={<RequestsStatusIcon status="approved" />}
                  title={__('Approve')}
                  onClick={() => handleBulkStatusChange('approved')}
                >
                  {activeRoles?.map((role) => (
                    <ActionButton
                      icon={<RequestsStatusIcon status="approved" />}
                      title={__('Approve to %ROLE%').replace('%ROLE%', role.name)}
                      onClick={() => handleBulkStatusChange('approved', role.id)}
                    />
                  ))}
                </ActionMenuButton>
                <ActionButton
                  icon={<RequestsStatusIcon status="rejected" />}
                  title={__('Reject')}
                  onClick={() => handleBulkStatusChange('rejected')}
                />
              </SelectActionButton>
              <Separator orientation="vertical" className="h-5!" />
              <AlertDialog open={openBulkDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="hover:text-destructive text-base-muted-foreground h-8 w-8 hover:shadow-xs"
                  onClick={() => setOpenDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {__('Are you sure you want to bulk delete requests?', 'yay-wholesale')}
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
            </TableToast>
          </TableToaster>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[#171719]">Rows per page:</span>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(value) => handleChangePerPage(value)}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 50, 100, 200].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <span className="mx-5 text-sm">
                Page {pagination.pageIndex + 1} of {data?.totalPage ?? 0}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex((data?.totalPage ?? 1) - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
