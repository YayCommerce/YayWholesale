import { useMemo } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { parseWPCurrency, parseWPDecimal } from '@/lib/helpers/format.helper';
import { useReportsQuery } from '@/lib/queries/reports.queries';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardSummary(props: { reportQuery: ReturnType<typeof useReportsQuery> }) {
  const { data: reportData, isFetching, isLoading } = props.reportQuery;
  const navigate = useNavigate();
  const cards = useMemo(
    () => [
      {
        title: 'Wholesalers',
        value: reportData?.wholesalersAmount ?? 0,
        percent: reportData?.wholesalersIncreaseRate ?? 0,
        desc: 'Total Wholesalers',
        button: () => (
          <Button
            variant="outline"
            size="sm"
            className="text-foreground h-9 w-fit leading-0"
            onClick={() => navigate('/wholesalers-list')}
          >
            {__('View all wholesalers', 'yay-wholesale-b2b')}
          </Button>
        ),
        overPercent:
          reportData && (reportData.wholesalersIncreaseRate > 100 || reportData.wholesalersIncreaseRate < -100),
      },
      {
        title: 'Wholesale Orders',
        value: reportData?.orderAmount ?? 0,
        percent: reportData?.orderIncreaseRate ?? 0,
        desc: 'Total Orders',
        button: () => (
          <a href={window.yayWholesaleB2BMeta.wcMeta.ordersUrl.list} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="text-foreground h-9 leading-0">
              {__('View all orders', 'yay-wholesale-b2b')}
            </Button>
          </a>
        ),
        overPercent: reportData && (reportData.orderIncreaseRate > 100 || reportData.orderIncreaseRate < -100),
      },
      {
        title: 'Wholesale Revenue',
        value: parseWPCurrency(reportData?.revenue ?? 0),
        percent: reportData?.revenueIncreaseRate ?? 0,
        desc: 'Total Revenue',
        button: () => (
          <a href={window.yayWholesaleB2BMeta.wcMeta.ordersUrl.list} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="text-foreground h-9 leading-0">
              {__('View all revenue', 'yay-wholesale-b2b')}
            </Button>
          </a>
        ),
        overPercent: reportData && (reportData.revenueIncreaseRate > 100 || reportData.revenueIncreaseRate < -100),
      },
    ],
    [reportData],
  );

  return (
    <div className={cn('grid gap-6 md:grid-cols-3', isFetching && !isLoading && 'relative opacity-50')}>
      {cards.map((c, i) => (
        <Card key={i} className="mt-0 rounded-lg shadow-none">
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-base font-medium">{c.title}</h3>
              <Badge
                variant="outline"
                className="flex h-[24px] gap-1 rounded-md px-2 py-1.5 text-xs font-semibold shadow-xs hover:bg-white"
              >
                {c.percent && c.percent < 0 ? (
                  <TrendingDown className="text-destructive h-1.25 w-2.5" />
                ) : (
                  <TrendingUp className="text-success h-1.25 w-2.5" />
                )}
                <p className="text-xs">
                  {c.percent && c.percent < 0 ? '' : '+'}
                  {parseWPDecimal(c.percent)}%
                </p>
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-foreground text-3xl font-semibold">
                {isLoading ? <Spinner className="text-muted-foreground size-6 animate-spin" /> : c.value}
              </p>
              <p className="pb-2 text-sm text-[#A0A0A7]">{c.desc}</p>
            </div>
            {c.button()}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
