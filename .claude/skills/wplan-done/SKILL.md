---
description: Delete a completed plan file and commit the removal. Run after all of a plan's checkpoints are done and merged.
---

# /wplan-done

Workflow - Close out a finished plan.

---

## Step 1 — Identify the Plan

If not given a slug, list `.claude/plans/` and ask the user which plan to close, unless only one exists.

---

## Step 2 — Confirm It's Actually Done

Check that all checkpoints in the plan are complete (ask the user if unclear). Do not delete a plan that's still in progress.

---

## Step 3 — Delete and Commit

```bash
git rm .claude/plans/<slug>.md
git commit -m "plan: remove <slug> (done)"
```

Tell the user:

> Plan `<slug>` closed and removed.
