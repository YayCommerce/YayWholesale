import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Crown } from 'lucide-react';

import { useReportsQuery } from '@/lib/queries/reports';
import { TopProductValue } from '@/lib/schema/reports';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { parseWPCurrency } from '../common.helper';

export default function TopProducts(props: { reportQuery: ReturnType<typeof useReportsQuery> }) {
  const { data: reportData, isFetching, isLoading } = props.reportQuery;

  return (
    <Card className="mt-0 rounded-lg py-0 shadow-none">
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-[#18181B]">Top Products</h3>
        </div>

        {/* DataTable */}
        <div
          className={cn(
            'overflow-hidden rounded-md border bg-white',
            isFetching && 'relative opacity-50',
          )}
        >
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader className="text-base-foreground h-[46px] bg-[#FAFAFA]">
              <TableRow className="bg-[#F4F4F5] text-[13px] font-semibold text-[#18181B]">
                <TableHead>
                  <span className="flex items-center justify-center font-medium text-gray-700">
                    {__('No', 'yay-wholesale')}
                  </span>
                </TableHead>
                <TableHead>{__('Product', 'yay-wholesale')}</TableHead>
                <TableHead>
                  <span className="flex items-center justify-center font-medium text-gray-700">
                    {__('Item Sold', 'yay-wholesale')}
                  </span>
                </TableHead>
                <TableHead>
                  <span className="flex items-center justify-center font-medium text-gray-700">
                    {__('Net Sales', 'yay-wholesale')}
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <Spinner className="text-muted-foreground size-6 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : reportData ? (
                reportData.topProducts.map((data) => (
                  <TableRow>
                    <TableCell className="py-3 text-[14px] text-[#18181B]">
                      <span className="flex items-center justify-center">
                        {reportData.topProducts.indexOf(data) + 1}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-[14px] text-[#18181B]">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 overflow-hidden rounded-md border">
                          <img
                            src={data.image}
                            alt={data.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex w-40 items-center gap-1 md:w-15 md:flex-wrap lg:w-40 lg:flex-nowrap">
                          <span className="text-[15px] font-medium whitespace-normal text-[#18181B] md:text-[13px] lg:text-[15px]">
                            {data.name}
                          </span>
                          {reportData.topProducts.indexOf(data) < 3 && (
                            <Crown fill="#F9BD09" size={14} className="ml-1 text-[#F9BD09]" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-[14px] text-[#18181B]">
                      <span className="flex items-center justify-center">{data.orderCount}</span>
                    </TableCell>
                    <TableCell className="py-3 text-[14px] text-[#18181B]">
                      <span className="flex items-center justify-center font-medium text-gray-700">
                        {parseWPCurrency(data.netSale)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {__('No results', 'yay-wholesale')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
