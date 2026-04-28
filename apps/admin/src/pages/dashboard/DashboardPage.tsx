import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { DateRange } from 'react-day-picker';
import { __ } from '@wordpress/i18n';

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
    <div className="mx-auto mt-[28px] flex max-w-7xl flex-col gap-6 px-6">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <h1 className="text-2xl font-bold">{__('Dashboard', 'yay-wholesale-b2b')}</h1>
        <DashboardDatePicker dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      <DashboardSummary reportQuery={reportQuery} />

      <div className="grid items-stretch gap-6 md:grid-cols-2">
        <TopWholesaleCustomers reportQuery={reportQuery} dateRange={dateRange} />
        <TopProducts reportQuery={reportQuery} />
      </div>
    </div>
  );
}
