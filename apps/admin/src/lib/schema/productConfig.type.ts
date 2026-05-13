// TODO: Product, Category edit page

import { Role } from './roles.schema';

export type PricingTier = {
  base_price: number; // From 1
  tiers: Array<{
    from_quantity: number;
    price: number;
  }>;
};

export type ProductRoleConfig = {
  discount_fixed?: number;
  discount_rate?: number;
  discount_tiers?: PricingTier;
};

export type ProductWholesaleConfig = {
  discount_mode: 'default' | 'custom';
  discount_rule: 'fixed' | 'rate' | 'tiers';
  wholesale_discount: Record<Role['slug'], ProductRoleConfig>;
};

// Only discountRate
export type CategoryWholesaleConfig = {
  discount_mode: 'default' | 'custom';
  wholesale_discount: Record<Role['slug'], number>;
};
