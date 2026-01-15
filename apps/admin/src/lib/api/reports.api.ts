import { __ } from '@wordpress/i18n';

import { DashboardReportsValue } from '../schema/reports';
import { api, handleResponse } from './base';

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
  const result = await handleResponse<DashboardReportsValue>(
    response,
    __('Failed to fetch reports', 'yay-wholesale-b2b'),
  );
  return result.data ?? {};
}
