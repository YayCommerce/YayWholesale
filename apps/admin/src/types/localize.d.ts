declare global {
  interface Window {
    yayWholesale: {
      user_urls: {
        list: string;
        add_new: string;
        edit: string;
      };
      plugin_url: string;
      rest_url: string;
      rest_nonce: string;
      rest_base: string;
      reviewed: boolean;
      roles: RoleFormValues[];
      settings: SettingsFormData;
      currency_data: {
        currency: string;
        symbol: string;
        position: string;
        thousand_sep: string;
        decimal_sep: string;
        num_decimals: number;
      };
      day_format: string;
      time_format: string;
    };
    wp: AnyObject;
  }
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'center' | 'right';
    isCheckbox?: boolean;
  }
}

export {};
