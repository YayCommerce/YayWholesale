import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Crown } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { useReportsQuery } from '@/lib/queries/reports.queries';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TopWholesaleCustomers(props: {
  reportQuery: ReturnType<typeof useReportsQuery>;
  dateRange: DateRange | undefined;
}) {
  const { data: reportData, isFetching, isLoading } = props.reportQuery;

  const startDate = useMemo(() => dayjs(props.dateRange?.from).format('YYYY-MM-DD'), [props.dateRange]);
  const endDate = useMemo(() => dayjs(props.dateRange?.to).format('YYYY-MM-DD'), [props.dateRange]);

  return (
    <Card className="mt-0 flex h-full flex-col rounded-lg shadow-none">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-[16px] font-semibold">
            {__('Top Wholesale Customers', 'yay-wholesale-b2b')}
          </h3>
        </div>

        {/* DataTable */}
        <div className={cn('min-h-0 flex-1 overflow-auto rounded-md border', isFetching && 'relative opacity-50')}>
          <Table className="min-w-full">
            <TableHeader className="text-foreground bg-muted-400 h-10">
              <TableRow className="text-foreground border-divider border-b text-[14px] font-semibold">
                <TableHead className="text-foreground text-[14px]">
                  <span className="flex items-center justify-center font-medium">{__('No', 'yay-wholesale-b2b')}</span>
                </TableHead>
                <TableHead className="text-foreground text-[14px]">{__('Customer', 'yay-wholesale-b2b')}</TableHead>
                <TableHead className="text-foreground text-[14px]">
                  <span className="flex items-center justify-center font-medium">
                    {__('Order number', 'yay-wholesale-b2b')}
                  </span>
                </TableHead>
                <TableHead className="text-foreground text-[14px]">
                  <span className="flex items-center justify-center font-medium">
                    {__('Role', 'yay-wholesale-b2b')}
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-divider border-b">
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
                  <TableRow className="border-divider border-b">
                    <TableCell className="text-foreground py-3 text-[14px]">
                      <span className="flex justify-center">{reportData.topWholesalers.indexOf(data) + 1}</span>
                    </TableCell>
                    <TableCell className="text-foreground py-3 text-[14px]">
                      <div className="flex items-center gap-3">
                        <Avatar
                          className={cn(
                            'h-8 w-8',
                            reportData.topWholesalers.indexOf(data) < 3 &&
                              'border-ring ring-1 ring-[#F9BD09] ring-offset-1',
                          )}
                        >
                          <AvatarImage src={data.avatar} alt={data.name} />
                          <AvatarFallback>{data.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex w-40 items-center gap-1 md:w-15 md:flex-wrap lg:w-40 lg:flex-nowrap">
                          <span className="text-foreground text-[14px] font-medium whitespace-normal md:text-[13px] lg:text-[14px]">
                            {data.name}
                          </span>
                          {reportData.topWholesalers.indexOf(data) < 3 && (
                            <Crown fill="#F9BD09" size={14} className="ml-1 text-[#F9BD09]" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground py-3 text-[14px]">
                      <span
                        className={cn(
                          'flex justify-center',
                          data.orderCount > 0 && data.id > 0 ? 'cursor-pointer hover:underline' : '',
                        )}
                        onClick={() => {
                          if (data.orderCount > 0 && data.id > 0) {
                            window.open(
                              window.yayWholesaleB2BMeta.wcMeta.ordersUrl.list +
                                '&_ywhs_order_type=wholesale' +
                                '&_customer_user=' +
                                data.id +
                                '&_ywhs_order_from=' +
                                startDate +
                                '&_ywhs_order_to=' +
                                endDate,
                              '_blank',
                            );
                          }
                        }}
                      >
                        {data.orderCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-foreground py-3 text-[14px]">
                      <div className="flex justify-center">
                        <Badge variant="dimmed-outline" className="cursor-default leading-0 font-semibold shadow-xs">
                          {data.role}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {__('No results.', 'yay-wholesale-b2b')}
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
