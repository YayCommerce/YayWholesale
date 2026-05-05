import { __ } from '@wordpress/i18n';

import { DashboardReports } from '../schema/reports.type';
import { api, handleResponse } from './api';

export async function fetchReports(
  startDate: string,
  endDate: string,
  compareStartDate: string,
  compareEndDate: string,
) {
  const url = 'reports';
  const searchParams = new URLSearchParams({
    startDate,
    endDate,
    compareStartDate,
    compareEndDate,
  });

  const response = await api.get('reports', {
    searchParams,
  });
  const result = await handleResponse<DashboardReports>(response, __('Failed to fetch reports', 'yay-wholesale-b2b'));
  return result.data ?? {};
}
