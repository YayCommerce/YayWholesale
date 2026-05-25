import { AccessByRole } from './common.schema';
import { Role } from './roles.schema';

// TODO v1.2: TieredDiscount
// TODO v1.2: access_options
export type TieredDiscount = { title: string; from: number; price: number }[];

export type ProductWholesaleOptions = {
  discount_rule: 'default' | 'custom';
  discount_type: 'rate' | 'fixed' | 'tiered';
  discount_rates: Record<Role['slug'], number>;
  discount_fixed: Record<Role['slug'], number>;
  discount_tiered: Record<'retailers' | Role['slug'], TieredDiscount>;

  access_options: AccessByRole;
};

// Only discount_type is 'rate'
export type CategoryWholesaleOptions = {
  discount_rule: 'default' | 'custom';
  discount_rates: Record<Role['slug'], number>;

  access_options: AccessByRole;
};
