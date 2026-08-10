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

export function exportPricingCsv() {
  return api.post('pricing/export').json<{ file: string }>();
}

export function importPricingCsv(formData: FormData) {
  return api
    .post('pricing/import', {
      body: formData,
    })
    .json<{ logs: string[] }>();
}
