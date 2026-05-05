import { api } from '@/lib/api/api';
import { Settings } from '@/lib/schema/settings.schema';
import type { ApiResponse } from './api.type';

export async function postSettings(data: Settings) {
  return await api.post('settings', { json: data }).json<ApiResponse<Settings>>();
}

export async function updateEmailStatus(emailId: string, status: boolean) {
  return await api.post(`emails/update-status`, { json: { emailId, status } }).json<ApiResponse<boolean>>();
}

export async function markReviewed() {
  return await api.post('mark-reviewed').json<ApiResponse<boolean>>();
}
