---
description: Interactive dev workflow — develop an agreed plan checkpoint by checkpoint, with review between each.
---

# /wdev

Workflow - Interactive development. Use this once a plan is agreed (from `/wplan`).

**Read `.claude/docs/context-dev-convention.md` before starting.**

---

## Step 0 — Get the Plan

Check `.claude/plans/` for a plan matching this task.

- **Found**: read it — this gives you the goal, approach, and checkpoints.
- **Not found**: run the `wplan` skill first to create one. Do not proceed to Step 1 until a plan exists and is confirmed.

---

## Step 1 — Branch

Check the current branch (`git branch --show-current`) and develop on it by default.

- If it's `develop` or `main`: create a new branch off it first (see branch naming in the doc) — never commit directly to those.
- Otherwise: stay on the current branch unless the user asks for a new one.

---

## Step 2 — Develop (Checkpoint Loop)

Work through the plan's checkpoints one at a time:

1. Announce which checkpoint you're starting
2. Implement it — add or update a test case if it changes behavior
3. Before asking for review:
   - **Format + typecheck** (see "Format Before Commit" in `.claude/docs/context-dev-convention.md`)
   - **Unit tests**: run `pnpm test` for every touched package — fix failures before continuing
   - **e2e**: if the diff touches booking flow, plugin activation, or admin forms → run `/we2e` with the relevant suite; otherwise skip (smoke tests run in CI on PR)
   - **Dev server**: tell the user to run `run dev` to verify in the browser
4. Present a summary of what was done and what to test:

> **Checkpoint 1 complete: <name>**
>
> Changes:
> - `path/to/file.tsx` — description
>
> Dev server: `run dev`
>
> To test: <specific steps>
>
> Ready for review. Should I continue to checkpoint 2?

5. **Auto-judge after each checkpoint:**
   - **Auto-continue** when: build clean, changes additive (no breaking changes, no data migrations, reversible).
   - **Stop for review** when: breaking change, security-sensitive code, complex core logic, or hard to reverse.
   - State your call in one line.

If the user finds an issue during review, fix it before moving on. Do not start the next checkpoint until the current one is approved.

If the plan turns out to be wrong or incomplete mid-development, stop and revise it with the user before continuing.

---

## Done

After all checkpoints are approved:

1. Push the branch: `git push -u origin <branch>`
2. Ensure a PR exists targeting `develop` — create one with `gh pr create` if none exists
3. Wait for CI: poll `gh pr checks <number>` every 60s until all checks pass or fail
4. If CI fails: read the failed log with `gh run view --log-failed`, fix the issue, push, and re-poll
5. Report the final result:

> All done. PR #<number> — CI passed. / CI failed on <job>: <reason>.
