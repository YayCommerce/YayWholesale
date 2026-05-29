import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

export const isPro = import.meta.env.VITE_PLAN === 'pro';
export const isLite = !isPro;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      transition: ['transition-default'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getPagesForWholesaleStore = () => {
  return window.yayWholesaleB2BAdmin.valid_wholesale_store_pages;
};

export const getPaymentMethodsInfo = () => {
  return window.yayWholesaleB2BMeta.wcMeta.payment_methods_info;
};

export const getShippingMethodsInfo = () => {
  return window.yayWholesaleB2BMeta.wcMeta.shipping_methods_info;
};
