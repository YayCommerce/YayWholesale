import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { differenceInCalendarDays, format, subDays } from 'date-fns';

import { fetchReports } from '@/lib/api/reports.api';

export function useReportsQuery(startDateObj: Date, endDateObj: Date) {
  const { startDate, endDate, compareStartDate, compareEndDate } = useMemo(() => {
    const diffInDays = differenceInCalendarDays(endDateObj, startDateObj);
    return {
      startDate: format(startDateObj, 'yyyy-MM-dd'),
      endDate: format(endDateObj, 'yyyy-MM-dd'),
      compareStartDate: format(subDays(startDateObj, diffInDays + 1), 'yyyy-MM-dd'),
      compareEndDate: format(subDays(endDateObj, diffInDays + 1), 'yyyy-MM-dd'),
    };
  }, [startDateObj, endDateObj]);

  return useQuery({
    queryKey: ['reports', { startDate, endDate, compareStartDate, compareEndDate }],
    queryFn: () => fetchReports(startDate, endDate, compareStartDate, compareEndDate),
    placeholderData: keepPreviousData,
  });
}
