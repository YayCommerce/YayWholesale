
declare global {
  interface Window {
    yayWholesale: {
      admin_url: string;
      plugin_url: string;
      i18n: Record<string, string>;
      rest_url: string;
      rest_nonce: string;
      rest_base: string;
      reviewed: boolean;
    };
    wp: AnyObject;
  }
}

export {};
