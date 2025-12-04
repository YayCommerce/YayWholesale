import { createContext, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { useReportsQuery } from '@/lib/queries/reports';
import { DashboardReportsValue } from '@/lib/schema/reports';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { parseWPDate } from '../common.helper';
import DashboardSummary from './DashboardSummary';
import TopProducts from './TopProducts';
import TopWholesaleCustomers from './TopWholesaleCustomers';

interface DashboardContextProp {
  reportData: DashboardReportsValue;
}

const defaultReport = {
  wholesalersAmount: 0,
  wholesalersIncreaseRate: 0,
  orderAmount: 0,
  orderIncreaseRate: 0,
  revenue: 0,
  revenueIncreaseRate: 0,
  topWholesalers: [],
  topProducts: [],
};
export const dashboardContext = createContext<DashboardContextProp>({
  reportData: defaultReport,
});

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: dayjs().subtract(30, 'day').toDate(),
    to: dayjs().toDate(),
  });

  const [previewDateRange, SetPreviewDateRange] = useState<DateRange | undefined>(dateRange);

  const { data } = useReportsQuery(dateRange);

  const displayDateRange = useMemo(
    () =>
      parseWPDate(dateRange?.from?.toDateString()) +
      ' - ' +
      parseWPDate(dateRange?.to?.toDateString()),
    [dateRange],
  );

  const saveChanges = () => {
    setDateRange(previewDateRange);
  };

  return (
    <div className="mx-auto mt-[84px] max-w-7xl space-y-6 px-6">
      <dashboardContext.Provider value={{ reportData: data ?? defaultReport }}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="z-1 flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-md border bg-white text-sm font-normal text-gray-700 shadow-sm"
                >
                  <CalendarIcon />
                  {displayDateRange}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="h-fit w-fit" align="end">
                <Calendar
                  mode="range"
                  defaultMonth={previewDateRange?.from}
                  selected={previewDateRange}
                  onSelect={SetPreviewDateRange}
                  numberOfMonths={2}
                  disabled={{
                    after: new Date(),
                  }}
                  className="hidden sm:block"
                />
                <Calendar
                  mode="range"
                  defaultMonth={previewDateRange?.from}
                  selected={previewDateRange}
                  onSelect={SetPreviewDateRange}
                  numberOfMonths={1}
                  disabled={{
                    after: new Date(),
                  }}
                  className="block sm:hidden"
                />
                <div className="mt-4 flex justify-end bg-white">
                  <Button onClick={saveChanges}>Save Changes</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DashboardSummary />

        <div className="grid gap-6 md:grid-cols-2">
          <TopWholesaleCustomers />
          <TopProducts />
        </div>
      </dashboardContext.Provider>
    </div>
  );
}
