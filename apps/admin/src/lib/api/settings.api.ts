import { api } from '@/lib/api/base';
import { Settings } from '@/lib/schema/settings.schema';
import type { Response } from './api.type';

export async function postSettings(data: Settings) {
  return await api.post('settings', { json: data }).json<Response<Settings>>();
}

export async function updateEmailStatus(emailId: string, status: boolean) {
  return await api.post(`emails/update-status`, { json: { emailId, status } }).json<Response<boolean>>();
}

export async function markReviewed() {
  return await api.post('mark-reviewed').json<Response<boolean>>();
}
