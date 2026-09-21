# CLAUDE.md

Yay Wholesale B2B —A comprehensive wholesale management plugin for WooCommerce that enables you to offer wholesale pricing, manage B2B customers, and track wholesale orders separately from retail sales. Monorepo: PHP backend + React 18 / TypeScript frontend, built with Vite 6 + PNPM.

## Mandatory conventions
- Avoid verbosity. Assume ADHD.
- Use ASD-STE100 Simplified Technical English
- Bottom line up front


## Key Commands

```bash
run dev:admin          # start dev servers
run build        # build all packages
run release          # create dist zips: lite and pro versions
run release:lite          # create dist zips: lite versions
run release:pro          # create dist zips: pro versions
```

## Branches

- Main: `develop`
- PRs target `develop`, not `main`

## Feature Documentation

Before starting any non-trivial task, scan this index. If the task or files match a doc's triggers, **read that doc first** with the Read tool.

| Doc | Tags | Triggers |
|-----|------|----------|
| `.claude/docs/context-plugin-list.md` | context, reference | which plugin, list of plugins, all plugins, addon list, wholesale-pro, free version, pro version |
| `.claude/docs/context-model-list.md` | context, reference, backend, frontend | data model, model relationship, Schema, options, meta data in order, post, taxonomy, products |
| `.claude/docs/context-dev-convention.md` | workflow, convention | branch naming, dev workflow, format, lint, prettier, eslint, checkpoint, /wplan, /wdev, plan, skill, lifecycle, verify, verification |
| `.claude/docs/context-page-map.md` | context, reference, pages, features | page map, feature map, admin pages, frontend pages, what pages exist, drawer, list, REST API endpoints, planning |

Advanced/rare-topic docs (background tasks, SSR sync, booking-form internals, admin appt form, booking pricing) are not indexed here — `/wplan`'s research step checks `.claude/docs/` directly for these during planning. For a quick task outside `/wplan`, name the doc yourself if you know it applies.

## Skills

| Skill | When to use |
|---|---|
| `/wplan` | Plan a non-trivial task before starting |
| `/wdev` | Develop an agreed plan checkpoint by checkpoint |
| `/wcheck` | Browser verification — run before calling any frontend task done |
| `/we2e` | Run e2e tests (Playwright + wp-env) — auto-selects suites from git diff; use when task touches plugin activation, booking flow, or admin forms |
| `/wplan-done` | Close out a finished plan |
| `/wsetup` | One-time check: verify all dev tools on a new machine |
