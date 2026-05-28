import { lazy } from 'react';
import { __ } from '@wordpress/i18n';

export const GeneralTab = lazy(() => import('./tabs/GeneralTab'));
export const DisplayTab = lazy(() => import('./tabs/DisplayTab'));
export const RegistrationTab = lazy(() => import('./tabs/RegistrationTab'));
export const RegistrationFieldsTab = lazy(() => import('./tabs/registration-fields/RegistrationFieldsTab'));
export const EmailsTab = lazy(() => import('./tabs/EmailsTab'));
export const PaymentRolesTab = lazy(() => import('./tabs/PaymentRolesTabs'));
export const ShippingRolesTab = lazy(() => import('./tabs/ShippingRolesTabs'));

export const SETTINGS_TABS = [
  { path: 'general', label: __('General', 'yay_wholesale_b2b'), errorKey: 'general', component: GeneralTab },
  { path: 'display', label: __('Display', 'yay_wholesale_b2b'), errorKey: 'display', component: DisplayTab },
  {
    path: 'registration',
    label: __('Registration', 'yay_wholesale_b2b'),
    errorKey: 'registration',
    component: RegistrationTab,
  },
  {
    path: 'registration-fields',
    label: __('Registration Fields', 'yay_wholesale_b2b'),
    errorKey: 'registration_fields',
    component: RegistrationFieldsTab,
  },
  { path: 'emails', label: __('Emails', 'yay_wholesale_b2b'), errorKey: 'emails', component: EmailsTab },
  {
    path: 'payment-roles',
    label: __('Payment Roles', 'yay_wholesale_b2b'),
    errorKey: 'payment_roles',
    component: PaymentRolesTab,
  },
  {
    path: 'shipping-roles',
    label: __('Shipping Roles', 'yay_wholesale_b2b'),
    errorKey: 'shipping_roles',
    component: ShippingRolesTab,
  },
];
