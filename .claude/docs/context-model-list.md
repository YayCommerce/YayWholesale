---
tags: [context, reference, backend, frontend]
triggers: [data model, model relationship, schema, options, meta data in order, post, taxonomy, products]
---

# Model List

Bottom line: no custom DB tables. Every entity lives in WP core tables (users, usermeta, posts, postmeta, options) or WooCommerce's own tables (`wc_orders`, `wc_orders_meta`).

---

## Core entities

| Model | Storage | PHP / Helper | TS Schema | TS Type |
|-------|---------|--------------|-----------|---------|
| Wholesale Role | option `yaywholesaleb2b_roles` (array of role configs) | [RolesHelper.php](../../includes/Helpers/RolesHelper.php) | [roles.schema.ts](../../apps/admin/src/lib/schema/roles.schema.ts) | — |
| Wholesale Customer | WP `wp_users` + WP role (no separate entity) | [WholeSalersHelper.php](../../includes/Helpers/WholeSalersHelper.php) | — | [wholesalers.type.ts](../../apps/admin/src/lib/schema/wholesalers.type.ts) |
| Registration Request | CPT `ywhs_request` (private, `manage_options`) | [RequestsHelper.php](../../includes/Helpers/RequestsHelper.php) | — | [requests.type.ts](../../apps/admin/src/lib/schema/requests.type.ts) |
| Wholesale Order | WooCommerce order (HPOS `wc_orders`/`wc_orders_meta`, or legacy `shop_order` post) + meta | [Orders.php](../../includes/Engine/Admin/Orders.php) | — | — |
| Promotion Rule (Pro) | inside option `yaywholesaleb2b_settings` (`promotionRules` array) | [PromotionRulesHelper.php](../../includes/Pro/Helpers/PromotionRulesHelper.php) | [promotion.schema.ts](../../apps/admin/src/lib/schema/promotion.schema.ts) | — |

Registered: `ywhs_request` CPT in [Settings.php:72](../../includes/Engine/Admin/Settings.php).

---

## Role config shape

`{ id, name, description, discount, minOrderQuantity, minOrderAmount, applyToSalePrice, status, slug }` — `slug` is the real WP role key.

Wholesaler list row = `WP_User` + role slug + live-computed order stats (`completedOrdersCount`, `wholesaleRevenue`). Not stored — computed via `WP_User_Query` + SQL join on `wc_orders`/`wc_orders_meta`.

---

## Taxonomy `yay_wholesale_b2b`

- Registered on `product` post type by Barn2 Product Table compat: [Barn2WoocommerceProductTable.php:83](../../includes/Engine/Compatibles/Barn2WoocommerceProductTable/Barn2WoocommerceProductTable.php).
- Pro reuses the slug for shop-template targeting on `product`, `wp_template`, `wp_template_part`: [TemplateEditor.php](../../includes/Pro/Engine/Admin/TemplateEditor.php).
- Taxonomy term `ywhs_shop_template` also used by [TemplatesHelper.php](../../includes/Pro/Helpers/TemplatesHelper.php) (Pro).

---

## Post / term meta (pricing and access)

| Meta key | Scope | Purpose | File |
|---|---|---|---|
| `yaywholesaleb2b_product_based_discount` | product post meta | Per-role discount override | [ProductPricingHelper.php](../../includes/Helpers/PricingHelpers/ProductPricingHelper.php) (Pro variant in `Pro/Helpers/PricingHelpers/`) |
| `yaywholesaleb2b_category_based_discount` | category term meta | Per-role discount override (Pro) | [CategoryPricingHelper.php](../../includes/Pro/Helpers/PricingHelpers/CategoryPricingHelper.php) |
| `yaywholesaleb2b_access_rule` | product post meta | Access rule type (Pro) | [ProductAccessHelper.php](../../includes/Pro/Helpers/AccessHelpers/ProductAccessHelper.php) |
| `yaywholesaleb2b_access_retailers` | product post meta | Retailer access flag (Pro) | same |
| `yaywholesaleb2b_access_wholesalers` | product post meta | Wholesaler access flag (Pro) | same |
| `yaywholesaleb2b-access_selected-roles` | product post meta | Comma-joined allowed role slugs (Pro) | same |
| `yaywholesaleb2b_cat_access` | category term meta | Category access rule (Pro) | [CategoryAccessHelper.php](../../includes/Pro/Helpers/AccessHelpers/CategoryAccessHelper.php) |
| `ywhs_template_visibility` | template post meta | Shop template visibility (Pro) | [TemplatesHelper.php](../../includes/Pro/Helpers/TemplatesHelper.php) |

---

## Post meta / user meta (Registration Request)

| Meta key | Scope | Purpose |
|---|---|---|
| `ywhs_request_data` | post meta | Serialized form answers |
| `ywhs_request_display_name` | post meta | Submitter display name |
| `ywhs_request_email` | post meta | Submitter email |
| `ywhs_request_status` | post meta | pending / approved / rejected |
| `ywhs_user_request_approved` | user meta | Points to the approved request post ID |

---

## Order meta (Wholesale Order)

| Meta key | Purpose |
|---|---|
| `_ywhs_wholesale_role` | Role slug active on the order. Join key between Order and Role/Customer |
| `_ywhs_order_type`, `_ywhs_order_from`, `_ywhs_order_to`, `_ywhs_from_dashboard` | Admin Orders list filters ([Orders.php](../../includes/Engine/Admin/Orders.php)) |
| `_ywhs_wholesale_email_trigger` | Flags wholesale order-placed email should fire |
| `_ywhs_extra_price_map` | Per-line-item extra pricing (requirement/fee adjustments) |
| `_ywhs_report_transient` | Cached report data |
| `_ywhs_role_from_user` | Snapshot of role at time of order/registration |
| `_ywhs_request_author` | Links a Request back to its originating user |

---

## Options (plugin settings)

| Option key | Purpose |
|---|---|
| `yaywholesaleb2b_roles` | Role configs |
| `yaywholesaleb2b_settings` | Main settings blob (general, registration_fields, promotion rules, etc) — [SettingsHelper.php](../../includes/Helpers/SettingsHelper.php) |
| `yaywholesaleb2b_shipping_roles` | Role → allowed shipping methods (Pro) |
| `yaywholesaleb2b_payment_roles` | Role → allowed payment gateways (Pro) |
| `yaywholesaleb2b_shop_block_templates` | Shop block-template slugs (Pro) |
| `yaywholesaleb2b_classic_shop_templates` | Classic shop template settings (Pro) |
| `ywhs_wholesale_layout` | Barn2 Product Table compat toggle |
| `yaywholesaleb2b_setup_helpful` | Setup wizard feedback flag |
| `yaywholesaleb2b_reviewed` | Review-nudge dismissed flag |
| `ywhs_setup_wizard_status` | fresh / completed |
| `yay-wholesale-b2b-pro_license_key`, `..._license_info` | License data |
| Core DB version (`MigrationHelper::CORE_DB_VERSION`) | Plugin version for migrations |

---

## REST controllers (resource map)

| Controller | Resource |
|---|---|
| [RolesRestController](../../includes/Controllers/RolesRestController.php) | CRUD for role configs |
| [RequestRestController](../../includes/Controllers/RequestRestController.php) | CRUD/approve/reject requests |
| [WholeSalersController](../../includes/Controllers/WholeSalersController.php) | List/filter wholesalers |
| [SettingsRestController](../../includes/Controllers/SettingsRestController.php) | Get/update settings |
| [SetupWizardRestController](../../includes/Controllers/SetupWizardRestController.php) | Wizard state |
| [ReportsRestController](../../includes/Controllers/ReportsRestController.php) | Dashboard aggregates |
| [Pro\Controllers\PricingRestController](../../includes/Pro/Controllers/PricingRestController.php) | Pricing CSV import/export |

---

## Relationships

```
Role (option)
  ├─ has many → Wholesale Customer (WP User with role slug)
  ├─ has many → Product/Category Pricing override (meta, keyed by role slug)
  ├─ has many → Order (order meta _ywhs_wholesale_role)
  ├─ has many → Access rule (Pro, product/category meta lists of allowed role slugs)
  └─ has many → Payment/Shipping restriction (Pro, option mapping role slug → method IDs)

Registration Request (CPT ywhs_request)
  ├─ belongs to → User (post_author, if submitted while logged in)
  └─ on approval → User gets ywhs_user_request_approved meta + WP role

Promotion Rule (Pro, inside yaywholesaleb2b_settings)
  └─ reads → Order history (wc_orders/wc_orders_meta joined on _ywhs_wholesale_role, _ywhs_role_from_user)
       to auto up/downgrade a User's Role
```
