import { Crown, Loader2 } from 'lucide-react';
import { __ } from '@wordpress/i18n';

import { parseWPCurrency } from '@/lib/helpers/format.helper';
import { useReportsQuery } from '@/lib/queries/reports.queries';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TopProducts(props: { reportQuery: ReturnType<typeof useReportsQuery> }) {
  const { data: reportData, isFetching, isLoading } = props.reportQuery;

  return (
    <Card className="overflow-hidden p-4 shadow-xs md:p-5 2xl:p-6">
      <CardContent className="flex min-h-0 flex-1 flex-col">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-medium">{__('Top Products', 'yay-wholesale-b2b')}</h3>
        </div>

        {/* DataTable */}
        <div
          className={cn(
            'min-h-0 flex-1 overflow-x-auto rounded-md border bg-white',
            isFetching && 'relative opacity-50',
          )}
        >
          <Table className="min-w-full">
            <TableHeader className="text-foreground bg-muted-400 h-10">
              <TableRow className="text-foreground border-divider border-b text-[14px] font-semibold">
                <TableHead className="text-foreground text-[14px]">
                  <span className="flex items-center justify-center font-medium">{__('No', 'yay-wholesale-b2b')}</span>
                </TableHead>
                <TableHead className="text-foreground text-[14px]">{__('Product', 'yay-wholesale-b2b')}</TableHead>
                <TableHead className="text-foreground text-[14px]">
                  <span className="flex items-center justify-center font-medium">
                    {__('Item Sold', 'yay-wholesale-b2b')}
                  </span>
                </TableHead>
                <TableHead className="text-foreground text-[14px]">
                  <span className="flex items-center justify-center font-medium">
                    {__('Net Sales', 'yay-wholesale-b2b')}
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-divider border-b">
                  <TableCell colSpan={4} className="h-32 text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="text-muted-foreground size-6 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : reportData && reportData.topProducts.length > 0 ? (
                reportData.topProducts.map((data, index) => (
                  <TableRow key={index} className="border-divider border-b">
                    <TableCell className="text-foreground py-3 text-[14px]">
                      <span className="flex items-center justify-center">
                        {reportData.topProducts.indexOf(data) + 1}
                      </span>
                    </TableCell>
                    <TableCell className="text-foreground py-3 text-[14px]">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'size-8 overflow-hidden rounded-md',
                            reportData.topProducts.indexOf(data) < 3 &&
                              'border-ring ring-1 ring-[#F9BD09] ring-offset-1',
                          )}
                        >
                          <img
                            src={
                              data.image
                                ? data.image
                                : `${window.yayWholesaleB2BMeta.wholesaleMeta.assetsUrl}/images/logo/favicon.svg`
                            }
                            alt={data.name}
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="flex w-full flex-1 items-center gap-1 md:w-15 md:flex-wrap lg:w-40 lg:flex-nowrap">
                          <span className="text-foreground line-clamp-3 text-[14px] font-medium whitespace-normal md:text-[13px] lg:text-[14px]">
                            {data.name}
                          </span>
                          {reportData.topProducts.indexOf(data) < 3 && (
                            <Crown fill="#F9BD09" size={14} className="ml-1 min-h-3.5 min-w-3.5 text-[#F9BD09]" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground py-3 text-[14px]">
                      <span className="flex items-center justify-center">{data.orderCount}</span>
                    </TableCell>
                    <TableCell className="text-foreground py-3 text-[14px]">
                      <span className="flex items-center justify-center font-medium">
                        {parseWPCurrency(data.netSale)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {__('No results', 'yay-wholesale-b2b')}
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
