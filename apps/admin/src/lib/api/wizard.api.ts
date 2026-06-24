import { api } from '@/lib/api/api';
import { Role } from '@/lib/schema/roles.schema';
import { Settings } from '@/lib/schema/settings.schema';
import { SetupWizardForm } from '@/lib/schema/wizard.schema';

export function saveSetup(data: SetupWizardForm) {
  return api.post('setup-wizard', { json: data }).json<{ roles: Role[]; settings: Settings }>();
}

export function skipSetup() {
  return api.post('setup-wizard/skip').json<boolean>();
}
