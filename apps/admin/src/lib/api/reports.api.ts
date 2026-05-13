import { DashboardReports } from '../schema/reports.type';
import { api } from './api';

export function fetchReports(startDate: string, endDate: string, compareStartDate: string, compareEndDate: string) {
  const searchParams = new URLSearchParams({
    startDate,
    endDate,
    compareStartDate,
    compareEndDate,
  });
  return api.get('reports', { searchParams }).json<DashboardReports>();
}
