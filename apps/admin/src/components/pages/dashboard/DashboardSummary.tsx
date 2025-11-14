import { TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardSummary() {
  const cards = [
    {
      title: 'Wholesalers',
      value: '345',
      percent: '+12.5%',
      desc: 'Visitors for the last 6 months',
      button: 'View all wholesalers',
    },
    {
      title: 'Wholesale Orders',
      value: '12,689',
      percent: '+12.5%',
      desc: 'Visitors for the last 6 months',
      button: 'View all orders',
    },
    {
      title: 'Wholesale Revenue',
      value: '$23,744,050',
      percent: '+39.8%',
      desc: 'Visitors for the last 6 months',
      button: 'View all revenue',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cards.map((c, i) => (
        <Card key={i} className="mt-0 rounded-lg py-0 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-[#171719]">{c.title}</h3>

              <Badge variant="outline" className="rounded-md text-xs font-semibold">
                <TrendingUp size={10} className="text-success" /> {c.percent}
              </Badge>
            </div>
            <p className="mt-2 text-[32px] font-semibold text-[#171719]">{c.value}</p>
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
