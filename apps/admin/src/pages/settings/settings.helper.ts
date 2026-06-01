import { FieldErrors } from 'react-hook-form';

import { Settings } from '@/lib/schema/settings.schema';
import { isPro } from '@/lib/utils';

export function makeDefaultSettings(settings: Settings): Settings {
  const defaultValues = structuredClone(settings);
  const { payment_methods_info, shipping_methods_info } = window.yayWholesaleB2BMeta.wcMeta;

  if (isPro) {
    defaultValues.payment_roles = payment_methods_info.map((paymentMethod) => {
      const foundSettings = settings.payment_roles?.find((s) => s.method_id === paymentMethod.method_id);
      if (foundSettings && foundSettings.enable_by_role) return foundSettings;

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
      if (foundSettings && foundSettings.enable_by_role) return foundSettings;

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
