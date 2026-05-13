// TODO: Product, Category edit page

import { Role } from './roles.schema';

export type PricingTier = {
  base_tier: number; // Price from 1
  tiers: Array<{
    from_quantity: number;
    price: number;
  }>;
};

export type ProductWholesaleDiscount = {
  discount_mode: 'default' | 'custom';
  discount_rule: 'rate' | 'fixed' | 'tiers';
  discount_fixed?: Record<Role['slug'], number>;
  discount_rate?: Record<Role['slug'], number>;
  discount_tiers?: Record<Role['slug'] | 'retailers', PricingTier>;
};

// Only discount_rate
export type CategoryWholesaleDiscount = {
  discount_mode: 'default' | 'custom';
  discount_rate: Record<Role['slug'], number>;
};
