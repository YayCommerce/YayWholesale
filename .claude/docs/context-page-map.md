---
tags: [context, reference, pages, features]
triggers: [page map, feature map, admin pages, frontend pages, what pages exist, drawer, list, REST API endpoints, planning]
---

# Page Map

Feature map — pages, what they contain, how they relate. Use when planning to understand scope and affected areas.

Bottom line: one WP admin menu page mounts a React SPA. All SPA views are client-side routes. Storefront features are Gutenberg blocks and PHP templates.

---

## Admin SPA — `/wp-admin/admin.php?page=yay_wholesale_b2b`

Router: [router.tsx](../../apps/admin/src/router.tsx), React Router `createHashRouter`. URLs look like `admin.php?page=yay_wholesale_b2b#/dashboard`.

| Page | Route | Contains |
|------|-------|----------|
| Setup Wizard | `/setup-wizard` | Steps: Welcome, RoleSetup, ReadyToGo. Auto-redirect here when `setup_wizard.status === 'fresh'` |
| Dashboard | `/dashboard` | KPIs, top products, top wholesale customers |
| Requests | `/requests`, `/requests/edit/:requestId` | List pending registration requests; Edit drawer to view/approve/reject |
| Wholesalers | `/wholesalers` | List approved wholesale customers; inline role reassignment |
| Roles | `/roles`, `/roles/new`, `/roles/edit/:roleSlug` | List/add/edit wholesale roles (pricing tiers), drawer form |
| Settings | `/settings/:subMenu` | Tabbed settings screen |

**Pattern:** list + drawer. Drawer component: [sheet.tsx](../../apps/admin/src/components/ui/sheet.tsx) (shadcn Sheet), used for every "add/edit single item over a list" flow — Requests, Roles, Registration Fields, Promotion Rules. Not separate pages/routes.

Error routes: `pages/404.tsx`, `pages/500.tsx`.

### Settings sub-tabs (`pages/settings/tabs/`)

| Sub-tab | Contains |
|---|---|
| `general` | Default role, store page, etc |
| `display` | Price/UI display for wholesale customers |
| `registration` | Registration flow, moderation, auto-approve |
| `registration-fields` | Custom registration form field builder; Add/Edit drawer + live preview |
| `promotion-rules` | Promotion rules (Pro), drawer form |
| `emails` | Enable/configure wholesale WooCommerce emails |
| `payment-roles` | Payment method restriction per role (Pro-gated, `UpgradeToUnlockPayment.tsx`) |
| `shipping-roles` | Shipping method restriction per role (Pro-gated, `UpgradeToUnlockShipping.tsx`) |
| `import-export` | CSV import/export of pricing (Pro) |

---

## WP Admin — Other (PHP-registered)

No per-feature `add_menu_page` calls in this plugin. Menu wiring is shared across YayCommerce plugins.

| Menu | Slug | Registered by |
|---|---|---|
| YayCommerce (top-level, shared) | `yaycommerce` | `vendor-prefixed/src/Menu/TopLevelMenu.php` |
| Yay Wholesale B2B (submenu) | `yay_wholesale_b2b` | `vendor-prefixed/src/Menu/PluginSubmenu.php`, config from [YayWholesaleB2BLicenseAdapter.php](../../includes/YayWholesaleB2BLicenseAdapter.php) (lite) / [YayWholesaleB2BProLicenseAdapter.php](../../includes/Pro/YayWholesaleB2BProLicenseAdapter.php) (pro). Cap `manage_woocommerce`. |

Other admin-area hooks (not separate pages):

| Area | File | Purpose |
|---|---|---|
| WC Orders screen | [Orders.php](../../includes/Engine/Admin/Orders.php) | Wholesale columns/filters |
| WP Edit User screen | [Users.php](../../includes/Engine/Admin/Users.php) → [edit-user.php](../../includes/Templates/user/edit-user.php) | "Wholesaler Information" box |
| Settings hooks | [Settings.php](../../includes/Engine/Admin/Settings.php) | Misc settings-page hooks |
| Emails | `includes/Engine/Admin/Emails/*` | Registers custom WooCommerce email classes |

---

## Frontend — Gutenberg blocks (`apps/blocks/`)

| Block | Path | Purpose |
|------|-----|----------|
| `yay-wholesale/request-registration-form-block` | `request-form-block/src/request-form-block/` | Storefront wholesale registration form (renders `RegistrationFieldsHelper::render_form()`) |
| `yay-wholesale/requirement-block` | `requirement-block/src/requirement-block/` | Min-order-quantity/amount progress bar (WP Interactivity API); shown to logged-in wholesale customers, e.g. cart |
| `requirement-slot-fill` | `apps/blocks/requirement-slot-fill/` | SlotFill into WC Cart/Checkout blocks; editor integration for requirement widget |
| `template-editor` | `apps/blocks/template-editor/` | Block-editor sidebar controls — configure requirement block/template settings (Pro) |

## Frontend — PHP templates

| Template | Purpose |
|---|---|
| `includes/Templates/request-form/registration-form.php` | Frontend registration form wrapper |
| `includes/Templates/request-form/registration-form-fields.php`, `registration-field*.php` | Per-field render partials |
| `includes/Templates/user/edit-user.php`, `edit-user-field-input.php` | Wholesaler info box on WP Edit User screen |
| `includes/Pro/Templates/custom-fixed-discounts/*.php` | Per-product/category fixed-discount UI on WC product/category edit screens (Pro) |
| `includes/Engine/Admin/Emails/templates/*` (+ `templates/plain/`) | Transactional emails: account-registration-approved/pending/rejected, new-account-registered, new-order-placed |

---

## REST API

Namespace: `yay-wholesale/v1` ([BaseRestController.php](../../includes/Controllers/BaseRestController.php)).

Browser console — `wpApiSettings.nonce` available on any WP admin page:

```js
fetch('/wp-json/yay-wholesale/v1/<endpoint>', { headers: { 'X-WP-Nonce': wpApiSettings.nonce } })
  .then(r => r.json()).then(console.log)
```

| Method | Route | Controller | Purpose |
|---|---|---|---|
| GET | `/wholesalers` | WholeSalersController | Paginated wholesaler list |
| PUT | `/wholesalers/{user_id}/update-role` | WholeSalersController | Change one user's role |
| PUT | `/wholesalers/bulk-update-role` | WholeSalersController | Bulk role change |
| GET | `/requests` | RequestRestController | Paginated request list |
| POST | `/requests` | RequestRestController | Submit registration request (public, cookie rate-limited) |
| GET/DELETE | `/requests/{id}` | RequestRestController | Get/delete single request |
| PUT | `/requests/{id}/approve`, `/reject` | RequestRestController | Approve/reject, assigns role |
| PUT | `/requests/bulk-approve`, `/bulk-reject` | RequestRestController | Bulk approve/reject |
| DELETE | `/requests/bulk-delete` | RequestRestController | Bulk delete |
| GET | `/requests/count-by-status` | RequestRestController | Counts for dashboard badges |
| GET | `/roles` | RolesRestController | List roles |
| POST | `/roles` | RolesRestController | Create role |
| PUT/DELETE | `/roles/{roleSlug}` | RolesRestController | Update/delete role |
| DELETE | `/roles/bulk-delete` | RolesRestController | Bulk delete |
| PUT | `/roles/bulk-status` | RolesRestController | Bulk enable/disable |
| GET | `/roles/count-users` | RolesRestController | User counts per role |
| GET | `/settings` | SettingsRestController | Fetch settings |
| POST | `/settings` | SettingsRestController | Update settings |
| POST | `/mark-reviewed` | SettingsRestController | Dismiss review nudge |
| POST | `/emails/update-status` | SettingsRestController | Enable/disable an email |
| GET | `/reports` | ReportsRestController | Sales report for dashboard |
| POST | `/setup-wizard` | SetupWizardRestController | Save wizard choices, mark completed |
| POST | `/setup-wizard/skip` | SetupWizardRestController | Mark skipped |
| PUT | `/setup-wizard/helpful` | SetupWizardRestController | Feedback flag |
| POST | `/pricing/export` (Pro) | Pro\Controllers\PricingRestController | Export pricing CSV |
| POST | `/pricing/import` (Pro) | Pro\Controllers\PricingRestController | Import pricing CSV |

Note: `POST /requests` is the only endpoint reachable by anonymous visitors. Gated by `yaywholesaleb2b_cid` cookie + 5-request rate limit, not a capability check. It is the storefront registration submit endpoint.
