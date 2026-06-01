import { Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router';
import { __ } from '@wordpress/i18n';

import { parseWPCurrency, parseWPDecimal } from '@/lib/helpers/format.helper';
import { useReportsQuery } from '@/lib/queries/reports.queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';

export default function DashboardSummary({ reportQuery }: { reportQuery: ReturnType<typeof useReportsQuery> }) {
  const { data: reportData, isFetching, isLoading } = reportQuery;
  const navigate = useNavigate();

  const wholesalersAmount = reportData?.wholesalersAmount ?? 0;
  const wholesalersIncreaseRate = reportData?.wholesalersIncreaseRate ?? 0;
  const wholesaleOrderAmount = reportData?.orderAmount ?? 0;
  const wholesaleOrderIncreaseRate = reportData?.orderIncreaseRate ?? 0;
  const wholesaleRevenue = reportData?.revenue ?? 0;
  const wholesaleRevenueIncreaseRate = reportData?.revenueIncreaseRate ?? 0;

  return (
    <div className="grid gap-3 md:grid-cols-3 md:gap-4 2xl:gap-6">
      <Card className="p-4 md:p-5 2xl:p-6">
        <CardContent className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-medium">{__('Wholesalers', 'yay-wholesale-b2b')}</h3>
            <TrendBadge percent={wholesalersIncreaseRate} isFetching={isFetching || isLoading} />
          </div>
          <p className="text-foreground mb-1.5 text-3xl leading-none font-semibold">
            {isFetching || isLoading ? <AmountSkeleton /> : wholesalersAmount}
          </p>
          <CardDescription className="mb-4">{__('Total Wholesalers', 'yay-wholesale-b2b')}</CardDescription>
          <Button variant="outline" size="sm" className="w-fit" onClick={() => navigate('/wholesalers')}>
            {__('View all wholesalers', 'yay-wholesale-b2b')}
          </Button>
        </CardContent>
      </Card>

      <Card className="p-4 md:p-5 2xl:p-6">
        <CardContent className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-medium">{__('Wholesale Orders', 'yay-wholesale-b2b')}</h3>
            <TrendBadge percent={wholesaleOrderIncreaseRate} isFetching={isFetching || isLoading} />
          </div>
          <p className="text-foreground mb-1.5 text-3xl leading-none font-semibold">
            {isFetching || isLoading ? <AmountSkeleton /> : wholesaleOrderAmount}
          </p>
          <CardDescription className="mb-4">{__('Total Orders', 'yay-wholesale-b2b')}</CardDescription>
          <Button variant="outline" size="sm" className="w-fit" asChild>
            <a href={window.yayWholesaleB2BMeta.wcMeta.ordersUrl.list} target="_blank" rel="noopener noreferrer">
              {__('View all orders', 'yay-wholesale-b2b')}
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="p-4 md:p-5 2xl:p-6">
        <CardContent className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-medium">{__('Wholesale Revenue', 'yay-wholesale-b2b')}</h3>
            <TrendBadge percent={wholesaleRevenueIncreaseRate} isFetching={isFetching || isLoading} />
          </div>
          <p className="text-foreground mb-1.5 text-3xl leading-none font-semibold">
            {isFetching || isLoading ? <AmountSkeleton /> : parseWPCurrency(wholesaleRevenue)}
          </p>
          <CardDescription className="mb-4">{__('Total Revenue', 'yay-wholesale-b2b')}</CardDescription>
          <Button variant="outline" size="sm" className="w-fit" asChild>
            <a href={window.yayWholesaleB2BMeta.wcMeta.ordersUrl.list} target="_blank" rel="noopener noreferrer">
              {__('View all revenue', 'yay-wholesale-b2b')}
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function TrendBadge({ percent, isFetching }: { percent: number; isFetching: boolean }) {
  return (
    <Badge variant="outline" className="h-6 rounded-md px-2 py-1.5">
      {isFetching ? (
        <Loader2 className="text-muted-foreground size-2.5 animate-spin" />
      ) : percent && percent < 0 ? (
        <TrendingDown className="text-destructive size-2.5" />
      ) : (
        <TrendingUp className="text-success size-2.5" />
      )}
      <p className="text-xs">
        {percent && percent < 0 ? '' : '+'}
        {parseWPDecimal(percent)}%
      </p>
    </Badge>
  );
}

function AmountSkeleton() {
  return <span className="bg-muted h-7.5 w-15 animate-pulse rounded-md" />;
}
