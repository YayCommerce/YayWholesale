---
description: Run YayWholesale e2e tests (Playwright + wp-env). Auto-selects spec files from git diff, or accepts an explicit path/project. Use when a task touches plugin activation, registration flow, or product/pricing behavior.
---

# /we2e

Run YayWholesale end-to-end tests. Stack: Playwright + `@wordpress/env`, config in `tests/e2e/`.

**Requires Docker to be running** (wp-env runs WordPress in containers).

There is no `@tag` grep system in this suite (unlike some other YayCommerce repos) — filtering is by spec file path and by single-site vs multisite project.

---

## Step 1 — Determine which specs to run

If the user passed an explicit spec path or `all`/`single`/`multi`, use that.

Otherwise:
```bash
git diff --name-only develop...HEAD
```

Map changed paths to spec files under `tests/e2e/tests/`:

| Changed path pattern | Spec(s) |
|---|---|
| Main plugin file, `includes/Engine/Register/`, activation/bootstrap code | `tests/basic/basic.spec.ts` |
| Product/pricing meta (`includes/Helpers/PricingHelpers/`, product-facing pricing logic) | `tests/product/product-create-simple.spec.ts` |
| Anything else / broad changes | all specs (coverage is currently thin — only 2 spec files exist, so "all" is cheap) |

Report the selected spec(s) and why before running.

---

## Step 2 — Install browsers (first run only)

```bash
pnpm test:e2e:install
```

---

## Step 3 — Start wp-env

Single-site is the default target for local verification:
```bash
pnpm env:start:single
```

Use `pnpm env:start:multi` only if the task is multisite-specific. `wp-env start` is idempotent — safe to call even if already running.

---

## Step 4 — Run tests

```bash
# Single-site, all specs
pnpm test:e2e:single

# Single-site, specific spec path
pnpm --filter @yay-wholesale/e2e run test:single tests/product

# Multisite
pnpm test:e2e:multi
```

---

## Step 5 — Report results

| Spec | Result |
|---|---|
| basic.spec.ts | Pass / Fail |
| product-create-simple.spec.ts | Pass / Fail |

If any test fails:
1. Show the failure message and file (Playwright HTML report: `tests/e2e/playwright-report/`)
2. Investigate root cause (read the relevant source file)
3. Fix if it's a test problem; report clearly if it's a real plugin bug

---

## Notes

- **Slow on first run** — `wp-env start` pulls Docker images, 60–120s. Subsequent runs are fast.
- **CI gate**: `.github/workflows/e2e.yml` runs single-site e2e on every push/PR to `develop`. This skill is for targeted local verification, not a full replacement.
- **Thin coverage today** — only `basic` and `product` specs exist. When a checkpoint adds meaningful new behavior with no matching spec, flag it to the user instead of silently skipping e2e coverage.
- To tear down: `pnpm env:stop:single` / `pnpm env:stop:multi` / `pnpm env:clean`.
