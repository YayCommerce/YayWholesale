import { keepPreviousData, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { DateRange } from 'react-day-picker';

import { fetchReports } from '../api/reports.api';

export const useReportsQuery = (dateRange: DateRange | undefined, compareDateRange: DateRange | undefined) => {
  const startDate = dayjs(dateRange?.from).format('YYYY-MM-DD');
  const endDate = dayjs(dateRange?.to).format('YYYY-MM-DD');
  const compareStartDate = dayjs(compareDateRange?.from).format('YYYY-MM-DD');
  const compareEndDate = dayjs(compareDateRange?.to).format('YYYY-MM-DD');

  return useQuery({
    queryKey: ['reports', { startDate, endDate, compareStartDate, compareEndDate }],
    queryFn: () => {
      return fetchReports(startDate, endDate, compareStartDate, compareEndDate);
    },
    placeholderData: keepPreviousData,
  });
};
