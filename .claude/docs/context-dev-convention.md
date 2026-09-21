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

---

## Format Before Commit

Per touched app (`apps/admin`, or a block under `apps/blocks/*`):

```bash
pnpm --filter <app-package-name> lint:fix
git add <files>
```

`lint:fix` runs eslint --fix then prettier --write. There is no root-level or PHP linter configured in this repo (no phpcs/phpcbf) — PHP changes are not auto-formatted, just reviewed by hand.

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
