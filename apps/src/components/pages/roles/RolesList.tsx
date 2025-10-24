import { useMemo, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Search } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { RolesListFormData } from '@/lib/schema/roles';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input, InputSuffix } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DeleteIcon from '@/components/icons/DeleteIcon';
import EditIcon from '@/components/icons/SettingsIcon';

export default function RolesList() {
  const navigate = useNavigate();
  const { watch } = useFormContext<RolesListFormData>();
  const data = watch('roles') || [];
  console.log(data);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const filteredData = useMemo(
    () =>
      data?.filter(
        (item) =>
          item?.name?.toLowerCase().includes(search.toLowerCase()) ||
          item?.description?.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, data],
  );

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const goToPage = (index: number) => {
    setPageIndex(Math.max(0, Math.min(index, totalPages - 1)));
  };

  const toggleAllRows = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((row) => row.id)));
    }
  };

  const toggleRow = (id: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const isAllSelected = paginatedData.length > 0 && selectedRows.size === paginatedData.length;

  return (
    <Card className="gap-4 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#000000]">{__('Roles')}</h1>

        <div className="flex flex-nowrap items-center gap-4">
          {data.length > 10 && (
            <div className="relative flex-none">
              <Input
                placeholder={__('Search')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageIndex(0);
                }}
                className="border-input w-80 rounded-sm border bg-white pr-9 text-sm font-normal"
              />
              <InputSuffix className="absolute top-1/2 right-3 -translate-y-1/2 bg-transparent px-0">
                <Search className="size-4.5 text-[#A0A0A7]" />
              </InputSuffix>
            </div>
          )}

          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 h-[34px] gap-2 rounded-sm px-4 text-sm font-medium"
            onClick={() => navigate('/roles/new')}
          >
            <Plus className="h-4 w-4" />
            {__('Add New Role')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
        <Table>
          <TableHeader className="bg-[#FAFAFA]">
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox checked={isAllSelected} onCheckedChange={toggleAllRows} />
              </TableHead>
              <TableHead className="text-left">Name</TableHead>
              <TableHead className="text-left">Description</TableHead>
              <TableHead className="text-center">Count</TableHead>
              <TableHead className="text-center">Discount</TableHead>
              <TableHead className="text-center">Min Order Quantity</TableHead>
              <TableHead className="text-center">Min Order Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length ? (
              paginatedData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedRows.has(row.id)}
                      onCheckedChange={() => toggleRow(row.id)}
                    />
                  </TableCell>
                  <TableCell className="text-left">{row.name}</TableCell>
                  <TableCell className="text-left">{row.description}</TableCell>
                  <TableCell className="text-center">{row.count}</TableCell>
                  <TableCell className="text-center">{row.discount}</TableCell>
                  <TableCell className="text-center">{row.minOrderQuantity}</TableCell>
                  <TableCell className="text-center">{row.minOrderAmount}</TableCell>
                  <TableCell className="text-center">
                    <Switch size="md" checked={row.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => navigate(`/roles/edit/${row.id}`)}
                        className="text-base-foreground hover:text-base-muted-foreground h-8 w-8 bg-transparent hover:bg-transparent"
                      >
                        <EditIcon className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-base-foreground hover:text-base-muted-foreground h-8 w-8 bg-transparent hover:bg-transparent"
                      >
                        <DeleteIcon className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-gray-500">
                  {__('No roles found.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      {selectedRows.size > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            {selectedRows.size} {__('of')} {filteredData.length} {__('row(s) selected.')}
          </p>

          <div className="flex items-center gap-4">
            {/* Rows per page */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              {__('Rows per page')}
              <Select
                value={pageSize.toString()}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="h-8 w-[70px] border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                {__('Page')} {pageIndex + 1} {__('of')} {totalPages}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                  onClick={() => goToPage(0)}
                  disabled={pageIndex === 0}
                >
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                  onClick={() => goToPage(pageIndex - 1)}
                  disabled={pageIndex === 0}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                  onClick={() => goToPage(pageIndex + 1)}
                  disabled={pageIndex + 1 >= totalPages}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                  onClick={() => goToPage(totalPages - 1)}
                  disabled={pageIndex + 1 >= totalPages}
                >
                  <ChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
