import { useMemo } from 'react';
import { Spinner } from '@wordpress/components';
import { TrendingDown, TrendingUp } from 'lucide-react';

import { useReportsQuery } from '@/lib/queries/reports';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { parseWPCurrency, parseWPDecimal } from '../common.helper';

export default function DashboardSummary(props: {
  reportQuery: ReturnType<typeof useReportsQuery>;
}) {
  const { data: reportData, isFetching, isLoading } = props.reportQuery;
  const cards = useMemo(
    () => [
      {
        title: 'Wholesalers',
        value: reportData?.wholesalersAmount ?? 0,
        percent: reportData?.wholesalersIncreaseRate ?? 0,
        desc: 'Total Wholesalers',
        button: 'View all wholesalers',
        overPercent:
          reportData &&
          (reportData.wholesalersIncreaseRate > 100 || reportData.wholesalersIncreaseRate < -100),
      },
      {
        title: 'Wholesale Orders',
        value: reportData?.orderAmount ?? 0,
        percent: reportData?.orderIncreaseRate ?? 0,
        desc: 'Total Orders',
        button: 'View all orders',
        overPercent:
          reportData && (reportData.orderIncreaseRate > 100 || reportData.orderIncreaseRate < -100),
      },
      {
        title: 'Wholesale Revenue',
        value: parseWPCurrency(reportData?.revenue ?? 0),
        percent: reportData?.revenueIncreaseRate ?? 0,
        desc: 'Total Revenue',
        button: 'View all revenue',
        overPercent:
          reportData &&
          (reportData.revenueIncreaseRate > 100 || reportData.revenueIncreaseRate < -100),
      },
    ],
    [reportData],
  );

  return (
    <div
      className={cn('grid gap-6 md:grid-cols-3', isFetching && !isLoading && 'relative opacity-50')}
    >
      {cards.map((c, i) => (
        <Card key={i} className="mt-0 rounded-lg py-0 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base-foreground text-base font-medium">{c.title}</h3>
              <Badge variant="outline" className="rounded-md text-xs font-semibold">
                {c.percent && c.percent < 0 ? (
                  <TrendingDown size={10} className="text-destructive" />
                ) : (
                  <TrendingUp size={10} className="text-success" />
                )}
                <p>
                  {c.percent && c.percent < 0 ? '' : '+'}
                  {c.overPercent ? (
                    <>
                      100<sup className="text-[10px]">+</sup> %
                    </>
                  ) : (
                    <>{parseWPDecimal(c.percent)}%</>
                  )}
                </p>
              </Badge>
            </div>
            <p className="text-base-foreground mt-2 text-3xl font-semibold">
              {isLoading ? (
                <Spinner className="text-muted-foreground size-6 animate-spin" />
              ) : (
                c.value
              )}
            </p>
            <p className="mt-1 text-sm text-[#A0A0A7]">{c.desc}</p>
            <Button
              variant="outline"
              size="sm"
              className="text-base-foreground mt-3 text-xs font-medium"
            >
              {c.button}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
