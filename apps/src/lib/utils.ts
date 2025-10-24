import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { RolesFormData } from './schema/roles';
import { SettingsFormData } from './schema/settings';

export const isPro = true;
export const isLite = !isPro;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSettings = (): SettingsFormData => {
  return window.yayWholesale.settings;
};

export const getRoles = (): RolesFormData[] => {
  return window.yayWholesale.roles;
};
