import { DashboardReports } from '../schema/reports.type';
import { api } from './api';
import type { ApiResponse } from './api.type';

export async function fetchReports(
  startDate: string,
  endDate: string,
  compareStartDate: string,
  compareEndDate: string,
) {
  const searchParams = new URLSearchParams({
    startDate,
    endDate,
    compareStartDate,
    compareEndDate,
  });
  return await api.get('reports', { searchParams }).json<ApiResponse<DashboardReports>>();
}
