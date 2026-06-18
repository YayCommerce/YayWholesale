import { FieldErrors } from 'react-hook-form';

import { Role } from '@/lib/schema/roles.schema';
import { Settings } from '@/lib/schema/settings.schema';
import { isPro } from '@/lib/utils';

export function makeDefaultSettings(settings: Settings, roles: Role[]): Settings {
  const defaultValues = structuredClone(settings);
  const { payment_methods_info, shipping_methods_info } = window.yayWholesaleB2BMeta.wcMeta;
  const roleSlugs = roles.map((r) => r.slug);

  if (isPro) {
    defaultValues.payment_roles = payment_methods_info.map((paymentMethod) => {
      const foundSettings = settings.payment_roles?.find((s) => s.method_id === paymentMethod.method_id);
      if (foundSettings && foundSettings.enable_by_role) {
        if (foundSettings.enable_by_role.wholesalers === 'enabled-selected-roles') {
          foundSettings.enable_by_role.selected_roles = foundSettings.enable_by_role.selected_roles.filter((rs) =>
            roleSlugs.includes(rs),
          );

          if (foundSettings.enable_by_role.selected_roles.length < 1) {
            foundSettings.enable_by_role.selected_roles = [];
            foundSettings.enable_by_role.wholesalers = 'disabled';
          }

          if (foundSettings.enable_by_role.selected_roles.length === roleSlugs.length) {
            foundSettings.enable_by_role.selected_roles = [];
            foundSettings.enable_by_role.wholesalers = 'enabled';
          }
        }

        return foundSettings;
      }

      return {
        method_id: paymentMethod.method_id,
        enable_by_role: {
          retailers: 'enabled',
          wholesalers: 'enabled',
          selected_roles: [],
        },
      };
    });

    defaultValues.shipping_roles = shipping_methods_info.map((shippingMethod) => {
      const foundSettings = settings.shipping_roles?.find((s) => s.instance_id === shippingMethod.instance_id);
      if (foundSettings && foundSettings.enable_by_role) {
        if (foundSettings.enable_by_role.wholesalers === 'enabled-selected-roles') {
          foundSettings.enable_by_role.selected_roles = foundSettings.enable_by_role.selected_roles.filter((rs) =>
            roleSlugs.includes(rs),
          );

          if (foundSettings.enable_by_role.selected_roles.length < 1) {
            foundSettings.enable_by_role.selected_roles = [];
            foundSettings.enable_by_role.wholesalers = 'disabled';
          }

          if (foundSettings.enable_by_role.selected_roles.length === roleSlugs.length) {
            foundSettings.enable_by_role.selected_roles = [];
            foundSettings.enable_by_role.wholesalers = 'enabled';
          }
        }

        return foundSettings;
      }

      return {
        instance_id: shippingMethod.instance_id,
        zone_id: shippingMethod.zone_id,
        enable_by_role: {
          retailers: 'enabled',
          wholesalers: 'enabled',
          selected_roles: [],
        },
      };
    });
  }

  return defaultValues;
}

const ERROR_SECTIONS = [
  'general',
  'display',
  'registration',
  'registration_fields',
  'payment_roles',
  'shipping_roles',
] satisfies (keyof Settings)[];

export function getFirstErrorSection(errors: FieldErrors<Settings>) {
  return ERROR_SECTIONS.find((key) => !!errors[key]);
}
