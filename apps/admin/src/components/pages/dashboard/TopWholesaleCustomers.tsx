import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Crown } from 'lucide-react';

import { useReportsQuery } from '@/lib/queries/reports';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function TopWholesaleCustomers(props: {
  reportQuery: ReturnType<typeof useReportsQuery>;
}) {
  const { data: reportData, isFetching, isLoading } = props.reportQuery;

  return (
    <Card className="mt-0 rounded-lg py-0 shadow-none">
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-[#18181B]">Top Wholesale Customers</h3>
        </div>

        {/* DataTable */}
        <div
          className={cn('overflow-hidden rounded-md border', isFetching && 'relative opacity-50')}
        >
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader className="text-base-foreground h-[46px] bg-[#FAFAFA]">
              <TableRow>
                <TableHead className="bg-[#F4F4F5]">
                  <span className="flex items-center justify-center font-medium text-gray-700">
                    {__('No', 'yay-wholesale')}
                  </span>
                </TableHead>
                <TableHead className="bg-[#F4F4F5]">{__('Customer', 'yay-wholesale')}</TableHead>
                <TableHead className="bg-[#F4F4F5]">
                  <span className="flex items-center justify-center font-medium text-gray-700">
                    {__('Orders', 'yay-wholesale')}
                  </span>
                </TableHead>
                <TableHead className="bg-[#F4F4F5]">
                  <span className="flex items-center justify-center font-medium text-gray-700">
                    {__('Role', 'yay-wholesale')}
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <Spinner className="text-muted-foreground size-6 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : reportData?.topProducts && reportData?.topProducts.length > 0 ? (
                reportData.topWholesalers.map((data) => (
                  <TableRow>
                    <TableCell className="py-3 text-[14px] text-[#18181B]">
                      <span className="flex justify-center">
                        {reportData.topWholesalers.indexOf(data) + 1}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-[14px] text-[#18181B]">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8">
                          <img
                            src={data.avatar}
                            alt={data.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[15px] font-medium text-[#18181B]">
                            {data.name}
                          </span>
                          {reportData.topWholesalers.indexOf(data) < 3 && (
                            <Crown fill="#F9BD09" size={14} className="ml-1 text-[#F9BD09]" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-[14px] text-[#18181B]">
                      <span className="flex justify-center">{data.orderCount}</span>
                    </TableCell>
                    <TableCell className="py-3 text-[14px] text-[#18181B]">
                      <div className="flex justify-center">
                        <Badge variant="ghost" className="rounded-md text-xs font-semibold">
                          {data.role}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No results.
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
