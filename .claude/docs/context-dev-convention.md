---
tags: [workflow, convention]
triggers: [branch naming, dev workflow, format, lint, prettier, eslint, checkpoint, /wplan, /wdev, plan, skill, lifecycle, verify, verification]
---

# Dev Convention

Quick reference: workflow skills, branch naming, formatting, verification.

---

## Workflow

| Skill | Does |
|-------|------|
| `/wplan` | Gathers requirements, researches, writes & commits plan. No code. |
| `/wdev` | Runs `/wplan` if no plan. Develops checkpoints interactively, with format+typecheck+test before each review. |
| `/wplan-done` | After checkpoints are done and merged — deletes the plan file. |

---

## Branch Naming

**Default: current branch.** New branch only if user asks, or current branch is `develop` (never commit directly to `develop`).

Prefixes: `feature/...`, `fix/...`, `research/...`, `release/...`. Branch off `develop`. Lowercase, hyphen-separated.

Plan files: `.claude/plans/<slug>.md`.

**Always set upstream on first push: `git push -u origin <branch-name>`.** A branch created off `develop` inherits `develop`'s tracking config until its own upstream is set — `git branch -vv` will show it as `[origin/develop: ...]`. A bare `git push` in that state pushes straight to `origin/develop`, not the feature branch. This has happened before (commits landed on `origin/develop` unnoticed). Check `git branch -vv` before the first push on any new branch; if it shows `origin/develop`, use the explicit `-u origin <branch-name>` form.

---

## Format Before Commit

Per touched app (`apps/admin`, or a block under `apps/blocks/*`):

```bash
pnpm --filter <app-package-name> lint:fix
git add <files>
```

`lint:fix` runs eslint --fix then prettier --write.

PHP is linted with PHPCS via root `phpcs.xml` (WordPress-Extra + PHPCompatibilityWP, PHP 7.4+). `phpcs`/`phpcbf` are not project-local (not in `vendor/bin` or `composer.json` scripts) — install globally (`composer global require squizlabs/php_codesniffer wp-coding-standards/wpcs phpcompatibility/phpcompatibility-wp`) and run:

```bash
phpcs --standard=phpcs.xml <path>     # check
phpcbf --standard=phpcs.xml <path>    # auto-fix
```

---

## Adding a JS Block

Any new JS block (under `apps/blocks/*`) needs a build step before it can be used — raw source is never loaded directly. Split the block into at least:

- `src/index.js` — main entry, registers the block/payment method (`registerBlockType`, `registerPaymentMethod`, etc.). Keep it thin.
- `src/render.js` — the UI: components, settings/state, markup. Exported and imported by `index.js`.

See `apps/blocks/requirement-slot-fill/src/` for the pattern. Run `pnpm build` (or the block's own build script) after adding/editing, then verify with `/wcheck` — an unbuilt block will not appear in WP.

Before shipping, check that WP block APIs used aren't deprecated (e.g. current `@wordpress/*` package APIs, current block.json schema version) — WordPress deprecates block APIs across major versions and stale patterns break silently or trigger console warnings.

**Write JSX, not `createElement`.** Use HTML tags directly (`<div className="...">`) instead of nested `createElement( 'div', {...} )` calls — JSX is what the build pipeline already supports and it's far more readable.

**Avoid `useEffect`.** Prefer event handlers and derived values computed during render. Reach for `useEffect` only as a last resort (e.g. subscribing to an external API like `onPaymentSetup` that has no other integration point) — most state updates don't need it.

---

## Dev Servers

```bash
pnpm dev:admin     # admin SPA (apps/admin) — Vite dev server
pnpm build         # builds all apps/blocks/* packages
```

---

## Verify Before Review

`apps/admin` has no standalone typecheck/test script — `tsc --noEmit` runs as part of build:

```bash
pnpm --filter @yay-wholesale/admin-page build:lite   # or build:pro
```

There is no unit test runner (no vitest/jest) configured for `apps/admin` or `apps/blocks/*` today. Rely on `/wcheck` and `/we2e` for behavior verification. If you add meaningful new logic, flag to the user that there's no unit test harness yet rather than silently skipping verification.

---

## Checkpoint Verification

Pick the cheapest method. See `context-page-map.md` for URLs/routes.

| Change type | Method |
|-------------|--------|
| PHP-only | Reload page in browser |
| PHP warnings | `curl -sk https://<dev-url>/ \| grep -i warning` |
| WP internals | `wp eval` via docker/wp-env |
| REST / backend data | `fetch('/wp-json/yay-wholesale/v1/...')` in browser console with `X-WP-Nonce: wpApiSettings.nonce` |
| React/TS (admin SPA) | `pnpm dev:admin`, then `/wcheck` |
| Plugin activation / registration flow / admin forms | `/we2e` |

**Order of preference:** REST fetch > wp eval > page reload > `/wcheck` > `/we2e` (slowest, but required for activation/registration-flow changes).

---

## Skill File Conventions

When editing any `.claude/skills/*/SKILL.md`:

- **General, not session-specific.** No references to the current task, PR, or specific code paths.
- **Concise.** Rules over examples. Cut any line that doesn't change behavior in a future session.
- **Principles over recipes.** Name the category of situation, not a specific instance of it.
