import { clsx, type ClassValue } from 'clsx';
import { HTTPError } from 'ky';
import { twMerge } from 'tailwind-merge';

import { showToast } from '@/components/custom/showToast';
import { RolesListValues } from './schema/roles';
import { SettingsFormData } from './schema/settings';

export const isPro = import.meta.env.VITE_IS_PRO === 'true';
export const isLite = !isPro;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSettings = (): SettingsFormData => {
  return window.yayWholesaleB2BAdmin.settings;
};

export const getRoles = (): RolesListValues[] => {
  return window.yayWholesaleB2BAdmin.roles;
};

export const handleErrorMessage = async (error: Error) => {
  let errorMessage = error.message ?? 'An Error has occurred!';
  if (error instanceof HTTPError) {
    const body = await error.response.json();
    if (!!body?.message) {
      errorMessage = body.message;
    }
  }
  showToast.error(errorMessage);
};
