import { roleSchema } from './roles.schema';
import { registrationSettingsSchema } from './settings.schema';

// TODO v1.2: setup wizard

const setupRoleSchema = roleSchema.pick({
  name: true,
  discount: true,
});

const setupRegistration = registrationSettingsSchema.pick({ moderate: true });
