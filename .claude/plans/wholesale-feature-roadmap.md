# Plan: Wholesale Feature Roadmap (Future Version Suggestions)

## Goal
Produce a prioritized, beginner-readable list of B2B/wholesale features suitable for a future version of Yay Wholesale B2B, checked against what the plugin (and other installed YayCommerce plugins) already handles, so nothing suggested is a duplicate.

## Approach
Research-only (no code). Reviewed `.claude/docs/context-plugin-list.md` and `.claude/docs/context-page-map.md` for existing Lite/Pro modules, then read the actual pricing (`ProductPricingHelper.php`) and access-restriction (`ProductAccessHelper.php`) source to confirm which of the user's candidate ideas were already implemented vs. genuinely new. User confirmed two additional duplicates against another already-owned plugin (Purchase List, Bulk Order Form). Final list narrowed from 14 candidates to 10 confirmed-new features, each documented with Why / Difficulty / What / Workflow / Approach / Risks, plus an Impact-vs-Effort priority ordering.

This output is a reference document for future planning, not an implementation checkpoint list — no code changes are scoped here.

## Confirmed duplicates (excluded from the list)
- **Volume-Based Quantity Pricing** — already implemented. `includes/Pro/Helpers/PricingHelpers/ProductPricingHelper.php` already stores a `tier_list` (quantity → price) per wholesale role and applies the matching tier at cart calculation time.
- **Reorder from Order History** — functionally the same as the "Purchase List" feature already handled in another plugin the user owns.
- **Bulk Order Form / Quick Order** — already handled in another plugin the user owns.
- **Customer-Specific Catalogs / Price Lists** — same core mechanism as existing product/category access restriction. `includes/Pro/Helpers/AccessHelpers/ProductAccessHelper.php` already restricts a product's visibility per wholesale role (visible-all / visible-specific-role). A "catalog" would only be this same show/hide logic grouped into a named list per individual customer instead of per role — not a distinct new mechanism.

## Final Feature List (10 features)

### 1. Request a Quote + Conversation — Difficulty 4/5
**Why:** Wholesalers negotiate price/quantity before buying; no such flow exists today (customer can only buy at the fixed listed price).
**What:** "Ask for a Quote" instead of "Add to Cart." Opens a chat-style conversation thread between customer and admin attached to that quote. Either side can send messages/counter-offers. Once agreed, admin converts the quote into a real WooCommerce order at the agreed price.
**Workflow:** Customer adds items to a Quote Cart → submits request → admin sees it in a new "Quotes" list (same list+drawer pattern as existing Requests) → thread-style back-and-forth messages → admin clicks "Convert to Order" once agreed → customer pays normally.
**Approach:** New DB record type for quotes (mirrors existing Requests pattern) + a linked messages table for the thread. Reuse existing admin list/drawer UI pattern and existing email-notification system.
**Risks:** Price drift between quote time and conversion time if product price changes; needs basic rate-limiting like the existing registration form; conversation UI must work well on mobile since buyers may expect quick replies.

### 2. Invoice PDF + Invoice Gateway — Difficulty 4/5
**Why:** B2B buyers expect a formal invoice document (often required for their own accounting) and often want to pay later rather than by card instantly.
**What:** Auto-generated PDF invoice per order, plus a "Pay by Invoice" checkout option that places the order on-hold instead of charging immediately.
**Workflow:** Wholesaler selects "Pay by Invoice" → order created on-hold → PDF invoice generated and emailed → customer pays outside the site (bank transfer, etc.) → admin manually marks the order Paid → order proceeds.
**Approach:** New WooCommerce payment gateway class; PDF generated via a PDF library; sequential invoice numbering stored in order meta.
**Risks:** Invoice numbers must never skip or repeat (accounting compliance) even under concurrent orders; added PDF-generation dependency could slow order placement if not handled carefully.

### 3. Purchase Order (PO) Gateway — Difficulty 2/5
**Why:** Large/government buyers pay via an internal PO number from their own finance department rather than a card.
**What:** Checkout option to enter a PO number (+ optional file upload); order held on-hold for manual admin confirmation.
**Workflow:** Customer selects "Pay by Purchase Order" → enters PO number/file → order placed on-hold with PO number attached → admin verifies externally → marks order confirmed.
**Approach:** New simple payment gateway class + one text field + file upload; PO number shown as a column on the existing Orders screen.
**Risks:** File uploads need type/size validation; otherwise low risk, mostly form + DB field work.

### 4. Net Terms / Pay Later (e.g. NET 30) — Difficulty 3/5
**Why:** Standard B2B credit arrangement — trusted buyers order now, pay within an agreed number of days, without upfront payment.
**What:** Per-role or per-customer payment-term length (e.g. 15/30/60 days). Due date auto-calculated; reminder emails sent; overdue orders flagged.
**Workflow:** Admin sets NET 30 on a role → customer checks out with no immediate payment → due date = order date + 30 days → automatic reminder email before due date → order flagged Overdue if unpaid past due date.
**Approach:** Add a `payment_terms` field to the existing Roles feature; reuse the existing scheduled-task (cron) pattern already used for automatic role upgrades to check due dates and send reminders.
**Risks:** Real financial exposure if a customer never pays — should not ship without feature 5 (Credit Limit); scheduler reliability depends on hosting/traffic (WP-Cron is not perfectly precise).

### 5. Credit Limit Management — Difficulty 3/5
**Why:** Safety net for feature 4 — caps how much unpaid debt one customer can carry before checkout is blocked.
**What:** Maximum unpaid balance set per role or per customer; checkout blocked/flagged once that total is reached.
**Workflow:** Admin sets a credit limit → system sums a customer's unpaid order totals → new order checked against remaining limit at checkout → blocked or held for approval if over.
**Approach:** New helper that totals unpaid orders per customer; hook into WooCommerce checkout validation.
**Risks:** Summing all unpaid orders on every checkout could be slow at scale — needs an efficient (e.g. cached) calculation; only useful paired with feature 4.

### 6. Subaccounts (Company Accounts) — Difficulty 5/5 (hardest item)
**Why:** A wholesale customer is often a company, not one person — multiple employees may need logins under one shared account with shared pricing but individual permissions.
**What:** One "company" account can create employee sub-logins beneath it. All share the company's wholesale role/pricing; each employee has a permission level (e.g. can place orders vs. needs approval).
**Workflow:** Company owner adds an employee by email with a permission level → employee sets password, logs in, sees company pricing → orders from any employee roll up under the company account for billing/reporting.
**Approach:** New link between WP user accounts (parent company ↔ employees) with a permission field; new "Team" admin screen; audit every place that currently assumes one order = one customer account.
**Risks:** Touches authentication, permissions, and order ownership — the most sensitive parts of the system; mistakes could expose one company's data to another. Needs its own dedicated planning cycle before implementation.

### 7. Order Approval Workflow — Difficulty 3/5 (depends on #6)
**Why:** Pairs directly with Subaccounts — an employee allowed to build a cart but not authorize spend needs a manager's sign-off before the order proceeds.
**What:** Orders from restricted employee accounts sit in "Pending Approval" until an approver (company owner/manager) accepts or rejects.
**Workflow:** Employee checks out → order held, not yet processed → approver notified → Approve (order proceeds to payment/processing) or Reject (customer notified, order cancelled).
**Approach:** New order status "Pending Approval" + a small approval screen for the approver.
**Risks:** Requires feature 6 to exist first; must handle the case where no approver is configured so orders don't get stuck.

### 8. Complex Tax / Fee Rules (by country, role, product) — Difficulty 4/5
**Why:** Some wholesale buyers are legally exempt from certain taxes (resale, cross-border trade rules) — WooCommerce's built-in flat tax settings can't express these exceptions.
**What:** Rule engine: IF customer role + shipping country + product/category match, THEN apply a specific tax treatment or fee.
**Workflow:** Admin defines a rule (e.g. "US Wholesale role + valid resale certificate → no sales tax") → matching customers automatically get that tax treatment at checkout.
**Approach:** Extends the existing condition-matching pattern used by current pricing rules, applied to tax instead of price; designed to work alongside a real tax service (Avalara/TaxJar), not replace one.
**Risks:** Getting tax wrong is a legal/financial liability for the shop owner, not just a bug — needs extra care and a clear disclaimer of responsibility.

### 9. Tax / Resale Exemption Certificate Upload — Difficulty 2/5
**Why:** Legally claiming tax exemption (feature 8) typically requires the buyer to submit an official certificate the seller keeps on file.
**What:** Wholesaler uploads their exemption certificate; admin reviews/approves; approved customers are automatically flagged exempt for feature 8's rules.
**Workflow:** Customer uploads certificate during signup or in their account → admin reviews via the existing approve/reject Requests-style screen → approved customers flagged tax-exempt.
**Approach:** Add a file-upload field type to the existing custom registration form builder; store files privately, not in a public/guessable location.
**Risks:** File storage must be secure — tax documents are sensitive business information.

### 10. Sales Rep / Account Manager Assignment — Difficulty 2/5
**Why:** B2B relationships are personal — wholesale buyers usually deal with one specific contact person, not an anonymous "contact us" form.
**What:** Assign a staff member as a wholesaler's dedicated rep; that rep's contact info shows on the customer's account and order emails.
**Workflow:** Admin opens a wholesaler's profile, assigns a rep from staff accounts → rep's info now displays on that customer's account/emails.
**Approach:** Small addition to the existing Wholesalers list/edit screen.
**Risks:** Very low — mostly display/UI work, no complex logic.

## Priority Order (Impact vs. Effort)

| Order | Feature | Impact | Effort |
|---|---|---|---|
| 1 | #3 Purchase Order Gateway | High | 2/5 |
| 2 | #10 Sales Rep Assignment | Low-Medium | 2/5 |
| 3 | #9 Tax Exemption Certificate Upload | Medium | 2/5 |
| 4 | #1 Request a Quote + Conversation | High | 4/5 |
| 5 | #2 Invoice PDF + Invoice Gateway | High | 4/5 |
| 6 | #4 Net Terms / Pay Later | High | 3/5 |
| 7 | #5 Credit Limit Management | Medium | 3/5 |
| 8 | #8 Complex Tax/Fee Rules | Medium | 4/5 |
| 9 | #6 Subaccounts | High (larger buyers) | 5/5 |
| 10 | #7 Order Approval Workflow | Medium | 3/5 |

Rationale: cheap/safe wins first (PO Gateway, Sales Rep, Certificate Upload) → Quote and Invoicing (high value, need real design time) → Net Terms + Credit Limit as a pair (don't ship one without the other) → Complex Tax rules → Subaccounts + Approval last (biggest, riskiest, and Approval depends on Subaccounts).

## Out of Scope
- No code, schema, or UI implementation in this pass — list/reference output only.
- No git commit of this plan file (explicitly skipped per user request).
- No `/wdev` handoff (explicitly skipped per user request).
- Detailed technical design (DB schema, API contracts, exact UI mockups) for any single feature — deferred to a dedicated `/wplan` when that feature is picked up for development.

## Meta
- Target branch: develop
- Base branch: develop
- Status: Reference/roadmap document only — not an active development plan.
