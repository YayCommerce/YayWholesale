import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const isPro = true;
export const isLite = !isPro;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const __ = (text: string): string => {
  const translations = window.yayWholesale.i18n || {};
  return translations[text] || text;
};
