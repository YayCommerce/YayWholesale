import { Settings } from '@/lib/schema/settings.schema';
import { isPro } from '@/lib/utils';

export function makeDefaultSettings(settings: Settings): Settings {
  const defaultValues = structuredClone(settings);
  const { payment_methods_info, shipping_methods_info } = window.yayWholesaleB2BMeta.wcMeta;

  if (isPro) {
    defaultValues.payment_roles = payment_methods_info.map((paymentMethod) => {
      const foundSettings = (settings.payment_roles ?? []).find(
        (setting) => setting.method_id === paymentMethod.method_id,
      );
      if (foundSettings && foundSettings.method_id && foundSettings.enable_by_role) return foundSettings;

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
      const existingShippingMethodSettings = (settings.shipping_roles ?? []).find(
        (setting) => setting.instance_id === shippingMethod.instance_id,
      );
      if (existingShippingMethodSettings && existingShippingMethodSettings.enable_by_role)
        return existingShippingMethodSettings;

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
