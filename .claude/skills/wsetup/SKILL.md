---
description: One-time dev environment check — run after cloning on a new machine to confirm all tools are wired.
---

# /wsetup

One-time setup verification. Not part of the dev loop.

---

## Step 1 — CLI tools

Check each is installed and report the version found (or missing):

```bash
node -v          # requires 23.x (see .nvmrc)
pnpm -v
php -v            # requires 7.4+ (repo dev uses 8.4)
composer -V
docker -v         # needed for wp-env / e2e
```

Then confirm dependencies install cleanly:
```bash
pnpm install
```
(`postinstall` runs `composer install` automatically.)

---

## Step 2 — e2e stack (optional, only if the dev plans to run `/we2e`)

```bash
pnpm test:e2e:install
pnpm env:start:single
```

If `wp-env start` fails, Docker is not running or not accessible — fix that first.

---

## Step 3 — Chrome extension

Load browser tools:

```
ToolSearch: select:mcp__claude-in-chrome__tabs_context_mcp
```

Call `tabs_context_mcp`. If it returns tab data → extension is live. If it errors → extension is not connected (install or enable it for this site).

---

## Done

Print a single table:

| Tool | Status |
|------|--------|
| node / pnpm | ✓ / ✗ |
| php / composer | ✓ / ✗ |
| docker + wp-env (if e2e planned) | ✓ / ✗ |
| Claude in Chrome | ✓ / ✗ |

One sentence: what's missing and the fix, or "All good — ready to develop."

Note: this repo has no phpcs/phpcbf, husky, or lint-staged configured — formatting is `eslint`/`prettier` inside each `apps/*` package only (see `context-dev-convention.md`).
