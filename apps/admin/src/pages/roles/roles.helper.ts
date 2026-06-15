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
    slug: role.slug,
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
  const rolePayments: RoleFormValues['paymentMethods'] = {
    enabled: 'enable-all',
    selected_methods: [],
  };
  if (isPro && role.slug && settings.payment_roles) {
    settings.payment_roles.forEach((pr) => {
      if (pr.enable_by_role.wholesalers === 'disabled') return;

      if (pr.enable_by_role.wholesalers === 'enabled' || pr.enable_by_role.selected_roles.includes(role.slug)) {
        rolePayments.selected_methods!.push(pr.method_id);
      }
    });

    if (rolePayments.selected_methods!.length < settings.payment_roles.length) {
      rolePayments.enabled = 'enable-selected-methods';
    }
  }
  return rolePayments;
}

export function getEditRoleShippingsField(role: Role, settings: Settings) {
  const roleShippings: RoleFormValues['shippingMethods'] = {
    enabled: 'enable-all',
    selected_methods: [],
  };
  if (isPro && role.slug && settings.shipping_roles) {
    settings.shipping_roles.forEach((sr) => {
      if (sr.enable_by_role.wholesalers === 'disabled') return;

      if (sr.enable_by_role.wholesalers === 'enabled' || sr.enable_by_role.selected_roles.includes(role.slug)) {
        roleShippings.selected_methods!.push(sr.instance_id);
      }
    });

    if (roleShippings.selected_methods!.length < settings.shipping_roles.length) {
      roleShippings.enabled = 'enable-selected-methods';
    }
  }
  return roleShippings;
}

export function getAddRolePaymentsField(settings: Settings) {
  const rolePayments: RoleFormValues['paymentMethods'] = {
    enabled: 'enable-all',
    selected_methods: [],
  };
  if (isPro && settings.payment_roles) {
    settings.payment_roles.forEach((pr) => {
      if (pr.enable_by_role.wholesalers != 'enabled') {
        rolePayments.enabled = 'enable-selected-methods';
      } else {
        rolePayments.selected_methods.push(pr.method_id);
      }
    });
  }
  return rolePayments;
}

export function getAddRoleShippingsField(settings: Settings) {
  const roleShippings: RoleFormValues['shippingMethods'] = {
    enabled: 'enable-all',
    selected_methods: [],
  };
  if (isPro && settings.shipping_roles) {
    settings.shipping_roles.forEach((pr) => {
      if (pr.enable_by_role.wholesalers != 'enabled') {
        roleShippings.enabled = 'enable-selected-methods';
      } else {
        roleShippings.selected_methods.push(pr.instance_id);
      }
    });
  }
  return roleShippings;
}
