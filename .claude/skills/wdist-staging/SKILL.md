---
description: Bump the plugin version and build lite/pro release zips for staging.
---

# /wdist-staging

Workflow - Bump version and build a distribution for staging.

This repo ships one plugin in two editions (lite/pro) — see `.claude/docs/context-plugin-list.md`. There is no multi-plugin monorepo here, so this skill always operates on the single `Version:` header shared by both editions.

---

## Step 1 — Read current version

Read the `Version:` line from the plugin header comment in [yay-wholesale-b2b.php](../../../yay-wholesale-b2b.php). Both editions share this version (Pro's `assets/pro/yay-wholesale-b2b-pro.php` header is kept in sync manually — check it matches; if it doesn't, ask the user which is correct before proceeding).

There is no separate PHP version constant to update — only the two header comments.

---

## Step 2 — Decide next version

**Version increment rules:**

| Current version | Next version |
|----------------|--------------|
| `X.Y.Z-rcN` | `X.Y.Z-rc(N+1)` |
| `X.Y.Z-devN` | `X.Y.Z-dev(N+1)` |
| Plain `X.Y.Z` | Ask the user: "Version is `X.Y.Z` — do you want `X.Y.Z-dev1`, `X.Y.Z-rc1`, or a custom version?" |

Show the user a preview before editing:

> I will bump the version: 1.2.2 → 1.2.3-dev1
>
> Proceed?

Wait for confirmation. Then edit the `Version:` header line in **both** [yay-wholesale-b2b.php](../../../yay-wholesale-b2b.php) and [assets/pro/yay-wholesale-b2b-pro.php](../../../assets/pro/yay-wholesale-b2b-pro.php), and the `Stable tag:` line in `readme.txt` if the user wants the readme updated too (ask).

---

## Step 3 — Build

Run from the project root:

```bash
pnpm release          # both editions
# or
pnpm release:lite     # lite only
pnpm release:pro      # pro only
```

This runs `release.sh`, which builds the admin SPA + block packages, strips dev-only files per `.distignore`, and zips into `build/yay-wholesale-b2b.zip` and/or `build/yay-wholesale-b2b-pro.zip`.

### Step 3.1 — If build fails

- Show the user a concise summary of the error (last 50 lines, key messages).
- Ask: "Auto-fix, or will you fix it manually?"
  - **Auto**: attempt a fix only if simple and clearly scoped (missing import, single-file TS type error). Re-run the build once. If it fails again, stop and ask the user.
  - **Manual**: wait — do not proceed until the user confirms the build is fixed.

---

## Step 4 — Done

> **Staging build complete!**
>
> | Edition | Version | Zip |
> |---|---|---|
> | Lite | 1.2.3-dev1 | `build/yay-wholesale-b2b.zip` |
> | Pro | 1.2.3-dev1 | `build/yay-wholesale-b2b-pro.zip` |

## Notes

- Always keep the lite and pro header versions in sync — they ship from the same tag/commit.
- Do not commit the version bump unless the user asks.
- `pnpm install` runs as part of `release.sh` — no need to run it separately first.
