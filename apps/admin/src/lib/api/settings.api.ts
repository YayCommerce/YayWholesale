import { api } from '@/lib/api/api';
import { Settings } from '@/lib/schema/settings.schema';

export function getSettings() {
  return api.get('settings').json<Settings>();
}

export function postSettings(data: Settings) {
  return api.post('settings', { json: data }).json<Settings>();
}

export function updateEmailStatus(emailId: string, status: boolean) {
  return api.post(`emails/update-status`, { json: { emailId, status } }).json<boolean>();
}

export function markReviewed() {
  return api.post('mark-reviewed').json<boolean>();
}
