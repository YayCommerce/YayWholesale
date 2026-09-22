---
description: Planning workflow — gather requirements, research the codebase, set goals and checkpoints, confirm the plan with the user, then hand off to /wdev. Use this before any non-trivial task when the approach is unclear or needs alignment. Does NOT write code.
---

# /wplan

Workflow - Planning only. Use this to define a task before developing it.

**Do not write any code or implement any solution. This skill ends by saving the confirmed plan and immediately starting `/wdev`.**

**Read `.claude/docs/context-dev-convention.md` before starting.**

---

## Step 1 — Gather Requirements

Ask the user clarifying questions until the task is unambiguous:

- What is the goal / expected outcome?
- What is the current behavior (if a bug or change)?
- Which plugins, pages, components, or areas are involved?
- Are there design references, mockups, or prior discussions?
- Are there constraints: performance, backward compatibility, scope limits?
- Any edge cases to handle or explicitly exclude?

Do not proceed until you have a clear, concrete picture of what needs to be built.

---

## Step 2 — Research

Gather any information needed to write a confident plan. This may include:

- Reading relevant source files, existing patterns, or related features
- Listing `.claude/docs/` and reading any doc matching this task's topic — including advanced/complex docs not listed in CLAUDE.md's index
- Tracing data flow, component hierarchy, or API contracts
- Identifying reuse opportunities or risky areas

Summarize findings briefly before moving on. If research reveals new ambiguities, return to Step 1.

---

## Step 3 — Write the Plan

Draft a plan with these sections:

```
## Goal
One-sentence summary.

## Approach
High-level technical approach — what changes, why, and how they fit together.

## Checkpoints
1. <Checkpoint name> — <what it delivers, what can be tested>
2. ...

## Out of Scope
Anything explicitly excluded.
```

**Checkpoint rules:**
- Each checkpoint = a meaningful, self-contained deliverable the user can test
- **Default to a single checkpoint** unless the task clearly warrants splitting
- Only use multiple checkpoints when ALL of the following are true:
  - More than 10 files will change, AND
  - The task takes more than 10 minutes, AND
  - There is critical risk involved (security change, complex core update, data migration)
- When in doubt, one checkpoint is better than two

---

## Step 4 — Confirm and Hand Off

Present the plan to the user and ask for a single confirmation:

> Here's the plan. Confirm and I'll save it and start development — or let me know what to adjust.

**Wait for approval.** Incorporate any feedback and show the revised plan if changes were made.

On confirmation:

1. Save the plan to `.claude/plans/<slug>.md`:

```markdown
# Plan: <title>

## Goal
...

## Approach
...

## Checkpoints
1. ...

## Out of Scope
...

## Meta
- Target branch: <current branch>  (new branch only if requested — see branch naming in the doc)
- Base branch: develop
```

Use a short, descriptive `<slug>` (e.g. `add-calendar-view`, `fix-booking-overlap`).

2. Commit the plan file:

```bash
git add .claude/plans/<slug>.md
git commit -m "plan: <slug>"
```

3. **Immediately continue into `/wdev`** — do not stop or ask the user to run it manually.
