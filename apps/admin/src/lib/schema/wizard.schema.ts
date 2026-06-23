import z from 'zod';

import { roleSchema } from './roles.schema';
import { registrationSettingsSchema } from './settings.schema';

export const setupRoleSchema = roleSchema.pick({
  name: true,
  discount: true,
});

export const setupRegistration = registrationSettingsSchema.pick({ moderate: true });

export const setupWizardFormSchema = z.object({
  defaultRole: setupRoleSchema,
  registration: setupRegistration,
});

export type SetupWizardForm = z.infer<typeof setupWizardFormSchema>;
