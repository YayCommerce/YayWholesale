import { useMemo, useState } from 'react';
import { subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { __ } from '@wordpress/i18n';

import { useReportsQuery } from '@/lib/queries/reports.queries';
import DashboardDatePicker from './DashboardDatePicker';
import DashboardSummary from './DashboardSummary';
import TopProducts from './TopProducts';
import TopWholesaleCustomers from './TopWholesaleCustomers';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: subDays(today, 30), to: today };
  });

  const { startDate, endDate } = useMemo(() => {
    if (dateRange && dateRange.from && dateRange.to) {
      return { startDate: dateRange.from, endDate: dateRange.to };
    }
    const today = new Date();
    return { startDate: subDays(today, 30), endDate: today };
  }, [dateRange]);

  const reportQuery = useReportsQuery(startDate, endDate);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 2xl:gap-6">
      <div className="flex flex-col items-start gap-x-4 gap-y-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{__('Dashboard', 'yay-wholesale-b2b')}</h1>
        <DashboardDatePicker dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      <DashboardSummary reportQuery={reportQuery} />

      <div className="grid gap-3 md:grid-cols-2 md:gap-4 2xl:gap-6">
        <TopWholesaleCustomers reportQuery={reportQuery} startDate={startDate} endDate={endDate} />
        <TopProducts reportQuery={reportQuery} />
      </div>
    </div>
  );
}
