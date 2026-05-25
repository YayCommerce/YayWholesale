import { Role } from '@/lib/schema/roles.schema';
import { Settings } from '@/lib/schema/settings.schema';

export type Meta = {
  wpMeta: {
    siteUrl: string;
    adminUrl: string;
    ajaxUrl: string;

    restRoot: string;
    restBase: string;
    restNonce: string;

    usersUrl: {
      list: string;
      new: string;
      edit: string;
    };
  };
  wholesaleMeta: {
    pluginUrl: string;
    assetsUrl: string;

    version: string;
    reviewed: boolean;

    experimentals: {
      wholesale_store_page: boolean;
    };
  };
  wcMeta: {
    ordersUrl: {
      list: string;
    };
    setting_urls: {
      payment: string;
      shipping: string;
    };
    currency_data: {
      currency: string;
      symbol: string;
      position: string;
      thousand_sep: string;
      decimal_sep: string;
      num_decimals: number;
    };
  };
};

export type AdminData = {
  roles: Role[];
  settings: Settings;
  wholesale_emails: {
    id: string;
    status: boolean;
    title: string;
    description: string;
    type: string;
    recipients: string;
    url: string;
  }[];
  valid_wholesale_store_pages: {
    id: string;
    title: string;
    slug: string;
  }[];
};
