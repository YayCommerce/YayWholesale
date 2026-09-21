# Plan: Purchase Order (PO) Gateway

## Goal
Add a Pro-only "Purchase Order (PO)" WooCommerce payment gateway: PO number + optional attachment at checkout (classic & block), editable/viewable on the order detail page, integrated with existing Payment Roles restriction.

## Approach
- Standard WC_Payment_Gateway subclass (like BACS/Cheque), Pro-only, auto-appears in existing Payment Roles restriction settings (no extra admin UI needed there).
- Classic checkout: payment_fields()/process_payment() render PO number (always required) + conditional file input (gateway setting "Require attachment").
- Block checkout: AbstractPaymentMethodType PHP integration + new React block package, file pre-uploaded via a small REST endpoint before place-order, PO number + attachment_id sent as payment_data.
- Attachment stored as a real Media Library attachment (mime-gated: pdf/jpg/jpeg/png, 5MB, client+server validated), served through an admin-only download handler rather than a public URL (PO docs are business-sensitive).
- Order detail page: PO number shown as an editable field (admin can correct/update it post-placement, saved via standard WC order meta save action), attachment shown as a view/download link (not replaceable).
- Order stays on WooCommerce's built-in "on-hold" status — no custom status. Gateway description text tells admin the order is pending PO verification.
- Small addition: PO number also shown on the customer's order-received page and order emails (data's already there, near-zero extra cost).

## Checkpoints
1. Core gateway + classic checkout + order detail (view + edit PO number) + attachment storage
   - POGateway class, settings (title/description/instructions/require_attachment toggle)
   - payment_fields()/validate_fields()/process_payment() for classic checkout
   - Attachment upload REST endpoint, mime/size validation, stored as media attachment
   - Admin-only download handler (no public attachment URL)
   - Order detail page: PO number editable field (save handler) + attachment view link
   - Customer-facing: PO number on order-received page + order emails
   - Testable: place a PO order via classic checkout, edit PO number as admin, verify attachment download gating

2. Block checkout integration
   - AbstractPaymentMethodType PHP integration, new apps/blocks/po-gateway-block package
   - React payment method: PO number field, conditional file input, pre-upload via checkpoint 1's endpoint
   - Wire attachment_id + po_number into Store API payment_data → process_payment
   - Testable: place a PO order via block checkout, same order meta/admin view/edit as checkpoint 1

## Out of Scope
- New/custom order status beyond built-in "on-hold"
- Automated PO verification, approval workflow, or accounting integration
- Replacing/re-uploading the attachment after order placement (only PO number is editable)
- Lite edition support (Pro-only)

## Meta
- Target branch: feature/po-gateway-payment-method
- Base branch: develop
