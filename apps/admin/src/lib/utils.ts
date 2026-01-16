import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { SettingsFormData } from './schema/settings';

export const isPro = import.meta.env.VITE_IS_PRO === 'true';
export const isLite = !isPro;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSettings = (): SettingsFormData => {
  return window.yayWholesale.settings;
};
