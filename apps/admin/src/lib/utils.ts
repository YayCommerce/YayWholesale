import { clsx, type ClassValue } from 'clsx';
import { HTTPError } from 'ky';
import { twMerge } from 'tailwind-merge';

import { toast } from '@/components/ui/sonner';
import { RolesListValues } from './schema/roles';

export const isPro = import.meta.env.VITE_IS_PRO === 'true';
export const isLite = !isPro;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getRoles = (): RolesListValues[] => {
  return window.yayWholesaleB2BAdmin.roles;
};

export const getPagesForWholesaleStore = () => {
  return window.yayWholesaleB2BAdmin.valid_wholesale_store_pages;
};

export const handleErrorMessage = async (error: Error) => {
  let errorMessage = error.message ?? 'An Error has occurred!';
  if (error instanceof HTTPError) {
    const body = await error.response.json();
    if (!!body?.message) {
      errorMessage = body.message;
    }
  }
  toast.error(errorMessage);
};
