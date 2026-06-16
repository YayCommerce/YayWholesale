import { Role, RoleFormValues } from '@/lib/schema/roles.schema';
import { Settings } from '@/lib/schema/settings.schema';
import { isPro } from '@/lib/utils';

export function isDefaultRole(role: Role) {
  const defaultRoleSlug = window.yayWholesaleB2BAdmin.settings.general.default_role;
  return defaultRoleSlug === role.slug;
}

export function isDefaultRoleSlug(roleSlug: string) {
  const defaultRoleSlug = window.yayWholesaleB2BAdmin.settings.general.default_role;
  return roleSlug.length > 0 && defaultRoleSlug === roleSlug;
}

export function makeDefaultEditRole(role: Role, settings: Settings) {
  const defaultValues: RoleFormValues = {
    role: {
      name: role.name,
      description: role.description,
      discount: role.discount,
      minOrderQuantity: role.minOrderQuantity,
      minOrderAmount: role.minOrderAmount,
      applyToSalePrice: role.applyToSalePrice,
      status: role.status,
    },
  };

  //Payment Methods
  defaultValues.paymentMethods = getEditRolePaymentsField(role, settings);
  //Shipping Methods
  defaultValues.shippingMethods = getEditRoleShippingsField(role, settings);
  return defaultValues;
}

export function makeDefaultAddRole(settings: Settings) {
  const defaultValues: RoleFormValues = {
    role: {
      name: '',
      description: '',
      discount: 0,
      minOrderQuantity: 0,
      minOrderAmount: 0,
      applyToSalePrice: false,
      status: true,
    },
  };
  //Payment Methods
  defaultValues.paymentMethods = getAddRolePaymentsField(settings);
  //Shipping Methods
  defaultValues.shippingMethods = getAddRoleShippingsField(settings);

  return defaultValues;
}

export function getEditRolePaymentsField(role: Role, settings: Settings) {
  if (!isPro) return;
  const rolePayments: RoleFormValues['paymentMethods'] = {
    enabled: 'enable-all',
    selected_methods: [],
  };

  const wcMeta = window.yayWholesaleB2BMeta.wcMeta;
  if (role.slug) {
    wcMeta.payment_methods_info.forEach((pm) => {
      if (!settings.payment_roles) {
        rolePayments.selected_methods.push(pm.method_id);
        return;
      }

      const setting = settings.payment_roles.filter((s) => s.method_id === pm.method_id)[0] ?? false;
      if (!setting) {
        rolePayments.selected_methods.push(pm.method_id);
        return;
      }

      if (setting.enable_by_role.wholesalers === 'disabled') return;
      if (
        setting.enable_by_role.wholesalers === 'enabled' ||
        setting.enable_by_role.selected_roles.includes(role.slug)
      ) {
        rolePayments.selected_methods.push(pm.method_id);
        return;
      }
    });

    if (rolePayments.selected_methods!.length < wcMeta.payment_methods_info.length) {
      rolePayments.enabled = 'enable-selected-methods';
    }
  }
  return rolePayments;
}

export function getEditRoleShippingsField(role: Role, settings: Settings) {
  if (!isPro) return;
  const roleShippings: RoleFormValues['shippingMethods'] = {
    enabled: 'enable-all',
    selected_methods: [],
  };

  const wcMeta = window.yayWholesaleB2BMeta.wcMeta;
  if (role.slug) {
    wcMeta.shipping_methods_info.forEach((sm) => {
      if (!settings.shipping_roles) {
        roleShippings.selected_methods.push(sm.instance_id);
        return;
      }

      const setting = settings.shipping_roles.filter((s) => s.instance_id === sm.instance_id)[0] ?? false;
      if (!setting) {
        roleShippings.selected_methods.push(sm.instance_id);
        return;
      }

      if (setting.enable_by_role.wholesalers === 'disabled') return;
      if (
        setting.enable_by_role.wholesalers === 'enabled' ||
        setting.enable_by_role.selected_roles.includes(role.slug)
      ) {
        roleShippings.selected_methods.push(sm.instance_id);
        return;
      }
    });

    if (roleShippings.selected_methods!.length < wcMeta.shipping_methods_info.length) {
      roleShippings.enabled = 'enable-selected-methods';
    }
  }
  return roleShippings;
}

export function getAddRolePaymentsField(settings: Settings) {
  if (!isPro) return;
  const rolePayments: RoleFormValues['paymentMethods'] = {
    enabled: 'enable-all',
    selected_methods: [],
  };
  const wcMeta = window.yayWholesaleB2BMeta.wcMeta;
  wcMeta.payment_methods_info.forEach((pm) => {
    if (!settings.payment_roles) {
      rolePayments.selected_methods.push(pm.method_id);
      return;
    }

    const setting = settings.payment_roles.filter((s) => s.method_id === pm.method_id)[0] ?? false;
    if (!setting) {
      rolePayments.selected_methods.push(pm.method_id);
      return;
    }

    if (setting.enable_by_role.wholesalers != 'enabled') {
      rolePayments.enabled = 'enable-selected-methods';
    } else {
      rolePayments.selected_methods.push(pm.method_id);
    }
  });

  return rolePayments;
}

export function getAddRoleShippingsField(settings: Settings) {
  if (!isPro) return;
  const roleShippings: RoleFormValues['shippingMethods'] = {
    enabled: 'enable-all',
    selected_methods: [],
  };
  const wcMeta = window.yayWholesaleB2BMeta.wcMeta;
  wcMeta.shipping_methods_info.forEach((sm) => {
    if (!settings.shipping_roles) {
      roleShippings.selected_methods.push(sm.instance_id);
      return;
    }

    const setting = settings.shipping_roles.filter((s) => s.instance_id === sm.instance_id)[0] ?? false;
    if (!setting) {
      roleShippings.selected_methods.push(sm.instance_id);
      return;
    }

    if (setting.enable_by_role.wholesalers != 'enabled') {
      roleShippings.enabled = 'enable-selected-methods';
    } else {
      roleShippings.selected_methods.push(sm.instance_id);
    }
  });
  return roleShippings;
}
