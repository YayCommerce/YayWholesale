import { useContext, useMemo } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { parseWPCurrency } from '../common.helper';
import { dashboardContext } from './DashboardPage';

export default function DashboardSummary() {
  const { reportData } = useContext(dashboardContext);
  const cards = useMemo(
    () => [
      {
        title: 'Wholesalers',
        value: reportData.wholesalersAmount,
        percent: reportData.wholesalersIncreaseRate,
        desc: 'Total Wholesalers Registed',
        button: 'View all wholesalers',
        type: 'text',
        overPercent:
          reportData.wholesalersIncreaseRate > 100 || reportData.wholesalersIncreaseRate < -100,
      },
      {
        title: 'Wholesale Orders',
        value: reportData.orderAmount,
        percent: reportData.orderIncreaseRate,
        desc: 'Total Orders',
        button: 'View all orders',
        type: 'text',
        overPercent: reportData.orderIncreaseRate > 100 || reportData.orderIncreaseRate < -100,
      },
      {
        title: 'Wholesale Revenue',
        value: reportData.revenue,
        percent: reportData.revenueIncreaseRate,
        desc: 'Total Revenue',
        button: 'View all revenue',
        type: 'currency',
        overPercent: reportData.revenueIncreaseRate > 100 || reportData.revenueIncreaseRate < -100,
      },
    ],
    [reportData],
  );

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cards.map((c, i) => (
        <Card key={i} className="mt-0 rounded-lg py-0 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-[#171719]">{c.title}</h3>
              <Badge variant="outline" className="rounded-md text-xs font-semibold">
                {c.percent < 0 ? (
                  <TrendingDown size={10} className="text-destructive" />
                ) : (
                  <TrendingUp size={10} className="text-success" />
                )}
                <p>
                  {c.percent < 0 ? '' : '+'}
                  {c.overPercent ? (
                    <>
                      100<sup className="text-[10px]">+</sup> %
                    </>
                  ) : (
                    <>{c.percent}%</>
                  )}
                </p>
              </Badge>
            </div>
            <p className="mt-2 text-[32px] font-semibold text-[#171719]">
              {c.type === 'currency' ? parseWPCurrency(c.value) : c.value}
            </p>
            <p className="mt-1 text-sm text-[#A0A0A7]">{c.desc}</p>
            <Button variant="outline" size="sm" className="mt-3 text-xs font-medium text-[#171719]">
              {c.button}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
