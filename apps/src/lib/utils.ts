import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const isPro = true;
export const isLite = !isPro;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
