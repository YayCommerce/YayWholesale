import { api } from '@/lib/api/api';
import { Role } from '@/lib/schema/roles.schema';
import { Settings } from '@/lib/schema/settings.schema';
import { SetupWizardForm } from '@/lib/schema/wizard.schema';

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

export function saveSetup(data: SetupWizardForm) {
  return api.post('setup-wizard', { json: data }).json<{ roles: Role[]; settings: Settings }>();
}

export function skipSetup() {
  return api.post('setup-wizard/skip').json<boolean>();
}
