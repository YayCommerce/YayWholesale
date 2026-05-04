import { AdminData, Meta } from './localize.type';

declare global {
  interface Window {
    yayWholesaleB2BMeta: Meta;
    yayWholesaleB2BAdmin: AdminData;
    wp: any;
  }
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'center' | 'right';
    isCheckbox?: boolean;
  }
}

export {};
