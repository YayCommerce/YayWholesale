---
tags: [context, reference]
triggers: [which plugin, list of plugins, all plugins, addon list, wholesale-pro, free version, pro version]
---

# Plugin List

Bottom line: edition (Lite vs Pro) is fixed at build time, not a runtime toggle. Single codebase.

---

## Core

| Plugin | Slug | Notes |
|--------|------|-------|
| Yay Wholesale B2B (Lite) | `yay-wholesale-b2b` | Public build. `release.sh` deletes `includes/Pro/` and `assets/pro/`. Bootstrap: `yay-wholesale-b2b.php` |
| Yay Wholesale B2B Pro | `yay-wholesale-b2b-pro` | Same codebase. Keeps `includes/Pro/` and `assets/pro/`. Swaps main file to `assets/pro/yay-wholesale-b2b-pro.php`; deletes the lite bootstrap. |

Both built from this repo. There is no separate source tree for Pro — just the `includes/Pro/` directory stripped out in the Lite build.

---

## How edition detection works

1. `YayWholesaleB2B::is_pro()` checks `class_exists('YayWholesaleB2B\Pro\YayWholesaleB2BPro')`. True only if Pro files shipped.
2. Pro code still needs an active license. [YayWholesaleB2BPro.php](../../includes/Pro/YayWholesaleB2BPro.php) gates all Pro engine classes behind `YayWholesaleB2BProLicenseAdapter::is_licensed()`. Checks options `yay-wholesale-b2b-pro_license_key` and `..._license_info`.
3. Two license adapters:
   - Lite: [YayWholesaleB2BLicenseAdapter.php](../../includes/YayWholesaleB2BLicenseAdapter.php) — has `get_pro_url()` upsell link.
   - Pro: [YayWholesaleB2BProLicenseAdapter.php](../../includes/Pro/YayWholesaleB2BProLicenseAdapter.php) — has `is_licensed()`. EDD item ID 66637.
4. Frontend build: `pnpm build:pro` vs `pnpm build:lite` in `apps/admin/package.json`. Separate Vite modes.
5. Frontend Pro-gate pattern: settings tabs like Payment Roles and Shipping Roles show an `UpgradeToUnlockPayment.tsx` / `UpgradeToUnlockShipping.tsx` upsell when not licensed.

---

## Pro-only modules

All under `includes/Pro/`.

| Feature | Files |
|---|---|
| Payment/shipping restriction per role | `Engine/Admin/PaymentGateway.php`, `Engine/Admin/ShippingMethod.php`, `Engine/Frontend/PaymentGateway.php`, `Engine/Frontend/ShippingMethod.php`, `Helpers/PaymentGatewayHelper.php`, `Helpers/ShippingHelper.php` |
| Product/category pricing rules + CSV import/export | `Engine/Admin/ProductBasedRule.php`, `Engine/Admin/CategoryBasedRule.php`, `Helpers/PricingHelpers/{Product,Category,Csv}PricingHelper.php`, `Controllers/PricingRestController.php`, `Engine/Frontend/Pricing.php`, `Templates/custom-fixed-discounts/*` |
| Access restriction (guest, product, category) | `Engine/Frontend/AccessRestriction.php`, `Helpers/AccessHelpers/{Category,Guest,Product}AccessHelper.php` |
| Promotion rules (auto role upgrade by revenue) | `Helpers/PromotionRulesHelper.php`, `Engine/Admin/PromotionRulesCron.php` |
| Template editor (separate shop layouts per role) | `Engine/Admin/TemplateEditor.php`, `Helpers/TemplatesHelper.php` |
| Store page customization | `Engine/Frontend/StorePage.php`, `Engine/Support/StorePage.php` |
| Requirement bar, block-theme variant | `Engine/Frontend/Requirement.php` |
| License/support | `Engine/Support/Support.php` |
| Pro REST routes | `Engine/RestAPI.php` |

Note: the basic Requirement progress bar ships in Lite. The min-order-quantity gate check itself is Pro-only ([RequirementHelper.php:29](../../includes/Helpers/RequirementHelper.php)).

---

## Core/Lite features

Always shipped, in `includes/` root.

| Area | Files |
|---|---|
| Wholesale role registration | `Engine/Register/RegisterFacade.php` |
| Admin | Settings, Users, Orders, Emails (`Engine/Admin/*`) |
| Frontend | Base Pricing, Coupon, Tax, RequestForm, basic Requirement bar |
| Third-party compatibility | `Engine/Compatibles/*` |
| Core REST API | `Engine/RestAPI.php` |
| Analytics dashboard, registration/moderation flow, wholesaler list | Admin SPA |

---

## Release build details

- `.distignore` strips dev-only paths from both builds: `apps`, `tests`, `tools`, `blocks/src`, `node_modules`, `.claude`. Only compiled `/build` and `/assets/dist` output ships.
- `RegisterDev.php` stripped from both builds.
- `yaycommerce-prerelease` vendor script runs before packaging.
- Commands: `run release` (both), `run release:lite`, `run release:pro`.

---

## Version info

- `readme.txt`: "Yay Wholesale B2B for WooCommerce", stable tag 1.2.2, GPLv2.
- Changelog tags Pro-only entries with `(Pro)`.
