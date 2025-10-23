declare global {
  interface Window {
    yayWholesale: {
      admin_url: string;
      plugin_url: string;
      rest_url: string;
      rest_nonce: string;
      rest_base: string;
      reviewed: boolean;
    };
    wp: AnyObject;
  }
}

export {};
