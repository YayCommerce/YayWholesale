import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { debounce } from 'lodash';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';

import { useRequestsQuery } from '@/lib/queries/requests';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { RequestsColumn } from './request-table/RequestsColumn';

export default function RequestsList() {
  const [search, setSearch] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const clientQuery = useQueryClient();
  const {
    data,
    isLoading: isLoadingRequests,
    isFetching: isFetchingRequests,
  } = useRequestsQuery(search, page, perPage);
  const columns = RequestsColumn;

  const table = useReactTable({
    data: data?.data_list ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  const debouncedSearch = useMemo(() => {
    return debounce(() => {
      clientQuery.invalidateQueries({ queryKey: ['requests'] });
    }, 500);
  }, [clientQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    debouncedSearch();
  };

  const goToPage = async (targetPage: number) => {
    await setPage(targetPage ?? 0);
    clientQuery.invalidateQueries({ queryKey: ['requests'] });
  };

  const perPageChange = async (value: string) => {
    await setPerPage(parseInt(value));
    await setPage(1);
    clientQuery.invalidateQueries({ queryKey: ['requests'] });
  };

  return (
    <div className="mx-auto mt-[84px] max-w-7xl space-y-6 px-6">
      <Card className="gap-3 p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">{__('Wholesaler Requests', 'yay-wholesale')}</h1>
          <InputGroup className="w-60">
            <InputGroupInput placeholder="Search" value={search} onChange={handleChange} />
            <InputGroupAddon align="inline-end">
              <Search />
            </InputGroupAddon>
          </InputGroup>
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
              {isLoadingRequests || isFetchingRequests ? (
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
        {!isFetchingRequests && data != undefined && data.data_list.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-muted-foreground text-sm">
              {selectedCount} of {data?.data_list.length} row(s) selected.
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm text-[#171719]">Rows per page:</span>
              <Select value={`${perPage}`} onValueChange={(value) => perPageChange(value)}>
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={perPage} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[1, 2, 5, 10, 20, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <span className="mx-5 text-sm">
                  Page {page} of {data?.lastPage ?? 0}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(data.firstPage)}
                  disabled={data?.curPage === data?.firstPage}
                >
                  <ChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(page - 1)}
                  disabled={!data?.canPre}
                >
                  <ChevronLeft />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(page + 1)}
                  disabled={!data?.canNext}
                >
                  <ChevronRight />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(data.lastPage)}
                  disabled={data?.curPage === data?.lastPage}
                >
                  <ChevronsRight />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
