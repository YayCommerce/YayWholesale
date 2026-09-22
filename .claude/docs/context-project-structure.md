---
tags: [context, reference, backend, frontend, workflow]
triggers: [project structure, directory structure, folder structure, where does this go, bootstrap, hook order, plugins_loaded, rest_api_init, singleton, register_rest_route, new controller, new engine class, where to put a new file]
---

# Project Structure

Bottom line: PHP is layered `Engine → Controllers → Helpers`, everything is a `SingletonTrait` singleton wired up through one bootstrap chain. Getting the hook timing wrong in that chain causes silent failures (e.g. 404 on a REST route) — see "Hook timing" below before adding any new singleton class.

---

## Directory layout

```
yay-wholesale-b2b.php          Lite bootstrap (plugins_loaded → plugin_init)
assets/pro/yay-wholesale-b2b-pro.php   Pro bootstrap (same, swapped in Pro build)

includes/
  YayWholesaleB2B.php           Core singleton — wires up all Lite engines + gates Pro
  Controllers/                  Core REST controllers
  Engine/
    Admin/                      Settings, Users, Orders, Emails
    Frontend/                   Pricing, Coupon, Tax, RequestForm, Requirement
    Register/                   Role/script registration (RegisterFacade, RegisterDev/Prod)
    Compatibles/                Third-party plugin compat shims
    RestAPI.php                 Core REST bootstrap (rest_api_init → controllers)
  Helpers/                      Static helper classes, no WP hooks
  Templates/                    PHP view partials
  Utils/SingletonTrait.php      Shared singleton pattern

includes/Pro/                   Stripped from Lite build by release.sh
  YayWholesaleB2BPro.php        Pro singleton — gated on license, wires up all Pro engines
  YayWholesaleB2BProLicenseAdapter.php
  Controllers/                  Pro REST controllers
  Engine/
    Admin/  Frontend/  Payment/  Support/
    RestAPI.php                 Pro REST bootstrap (rest_api_init → Pro controllers)
  Helpers/
  Templates/

apps/
  admin/                        React 18 + TS admin SPA (Vite), build:lite / build:pro
  blocks/                       Gutenberg blocks (po-gateway-block, request-form-block, requirement-block, requirement-slot-fill, template-editor)
```

Namespace mirrors path 1:1: `YayWholesaleB2B\Pro\Controllers\POGatewayRestController` → `includes/Pro/Controllers/POGatewayRestController.php` (autoloader in `yay-wholesale-b2b.php`).

---

## Bootstrap chain (order matters)

```
plugins_loaded
  → plugin_init()
      → YayWholesaleB2B::initialize()            (includes/YayWholesaleB2B.php)
          → Engine\RestAPI::get_instance()         hooks wholesale_endpoints() on rest_api_init
          → other Lite engines...
          → if is_pro(): Pro\YayWholesaleB2BPro::initialize()
              → gated: YayWholesaleB2BProLicenseAdapter::is_licensed()
              → Pro\Engine\RestAPI::get_instance()  hooks wholesale_endpoints() on rest_api_init
              → other Pro engines...

rest_api_init
  → Engine\RestAPI::wholesale_endpoints()         → Controllers::get_instance() for each core controller
  → Pro\Engine\RestAPI::wholesale_endpoints()      → Controllers::get_instance() for each Pro controller
```

`is_pro()` = `class_exists('YayWholesaleB2B\Pro\YayWholesaleB2BPro')` (Pro files present). Separate from licensing — see [context-plugin-list.md](context-plugin-list.md).

---

## Hook timing: register routes directly, don't nest `rest_api_init`

`*RestAPI::get_instance()` (both core and Pro) is itself called **from inside** the `rest_api_init` action. That means every REST controller's `get_instance()` — and therefore its constructor — already runs *during* `rest_api_init`.

**Correct pattern** — register routes straight in the constructor:

```php
protected function __construct() {
    $this->register_routes(); // or register_rest_route() calls directly
}
```

**Bug pattern** — wrapping registration in another `add_action('rest_api_init', ...)`:

```php
protected function __construct() {
    add_action( 'rest_api_init', [ $this, 'register_routes' ] ); // BUG
}
```

This adds a priority-10 callback to a priority-10 bucket that `WP_Hook` has already consumed in the current pass — it silently never fires. Result: `register_rest_route()` never runs, the route doesn't exist, and hitting the URL returns a plain 404 with no error logged anywhere. This exact bug hit [POGatewayRestController.php](../../includes/Pro/Controllers/POGatewayRestController.php) (fixed 2026-09-22) — `PricingRestController.php` next to it was already using the correct direct-call pattern.

Rule of thumb: if a singleton's `get_instance()` is called from *inside* a hook callback, don't re-hook the same action inside its constructor. Only hook an action from a constructor when that constructor runs *before* the action fires (e.g. the two `*Engine\RestAPI` classes themselves, called from `plugins_loaded`).

---

## Adding a new class checklist

1. Pick the layer: `Engine/*` (hooks into WP, stateful), `Controllers/*` (REST only, extends `BaseRestController`), or `Helpers/*` (pure static, no hooks).
2. `use SingletonTrait;` and add a `get_instance()` call to the right bootstrap:
   - Lite engine → [YayWholesaleB2B.php](../../includes/YayWholesaleB2B.php)
   - Pro engine → [YayWholesaleB2BPro.php](../../includes/Pro/YayWholesaleB2BPro.php)
   - Core REST controller → [Engine/RestAPI.php](../../includes/Engine/RestAPI.php) `wholesale_endpoints()`
   - Pro REST controller → [Pro/Engine/RestAPI.php](../../includes/Pro/Engine/RestAPI.php) `wholesale_endpoints()`
3. Check what hook the *caller* runs on, and only hook that same action again in your constructor if your class is instantiated *before* that action fires. See "Hook timing" above.
4. REST controllers: extend `BaseRestController`, use `self::REST_NAMESPACE`, use `exec_read`/`exec_write` wrappers for try/catch + response shaping.
