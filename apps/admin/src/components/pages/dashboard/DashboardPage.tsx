import { useMemo, useState } from 'react';
import { __ } from '@wordpress/i18n';
import dayjs from 'dayjs';
import { DateRange } from 'react-day-picker';

import { useReportsQuery } from '@/lib/queries/reports';

import DashboardDatePicker from './DashboardDatePicker';
import DashboardSummary from './DashboardSummary';
import TopProducts from './TopProducts';
import TopWholesaleCustomers from './TopWholesaleCustomers';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: dayjs().subtract(30, 'day').toDate(),
    to: dayjs().toDate(),
  });

  const compareDateRange = useMemo((): DateRange => {
    const to = dateRange?.to?.getTime() ?? 1;
    const from = dateRange?.from?.getTime() ?? 1;
    const gap = (to - from) / (1000 * 60 * 60 * 24);
    return {
      from: dayjs(dateRange?.from)
        .subtract(gap + 1, 'day')
        .toDate(),
      to: dayjs(dateRange?.to)
        .subtract(gap + 1, 'day')
        .toDate(),
    };
  }, [dateRange]);

  const reportQuery = useReportsQuery(dateRange, compareDateRange);

  return (
    <div className="mx-auto mt-[84px] max-w-7xl space-y-6 px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{__('Dashboard', 'yay-wholesale')}</h1>
        <DashboardDatePicker dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      <DashboardSummary reportQuery={reportQuery} />

      <div className="grid gap-6 md:grid-cols-2">
        <TopWholesaleCustomers reportQuery={reportQuery} />
        <TopProducts reportQuery={reportQuery} />
      </div>
    </div>
  );
}
