import { api } from '@/lib/api/api';
import { Settings } from '@/lib/schema/settings.schema';
import type { ApiResponse } from './api.type';

export function getSettings() {
  return api.get('settings').json<ApiResponse<Settings>>();
}

export function postSettings(data: Settings) {
  return api.post('settings', { json: data }).json<ApiResponse<Settings>>();
}

export function updateEmailStatus(emailId: string, status: boolean) {
  return api.post(`emails/update-status`, { json: { emailId, status } }).json<ApiResponse<boolean>>();
}

export function markReviewed() {
  return api.post('mark-reviewed').json<ApiResponse<boolean>>();
}
