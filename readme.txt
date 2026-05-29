=== Yay Wholesale B2B for WooCommerce ===
Contributors: YayCommerce
Tags: wholesale, b2b, wholesale pricing, discount rules, sale
Requires at least: 6.5
Tested up to: 7.0
Stable tag: 1.1.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

A comprehensive wholesale management plugin for WooCommerce that enables you to offer wholesale pricing, manage B2B customers, and track wholesale orders separately from retail sales.

## Description

WooCommerce treats all customers the same by default.

That’s fine for simple stores, but it quickly becomes a problem when you sell **wholesale**, **B2B**, or use **tiered pricing**.

When you need different prices, **minimum order quantities**, or exclusive products for specific customers, things get complicated fast.

💫 **Yay Wholesale B2B for WooCommerce** gives you full control.

Create wholesale roles, set custom pricing rules, and tailor the shopping experience for B2B customers, without messy workarounds.

Ready to run retail and wholesale from one WooCommerce store, with pricing that actually makes sense for your business?

👉 Manage wholesale customers, pricing tiers, and B2B rules effortlessly with Yay Wholesale B2B for WooCommerce.

## Key Features

### Wholesale Customer Management
- **Registration System**: Customizable registration forms with flexible field configuration
- **Role-Based Pricing**: Create unlimited wholesale roles with different discounts
- **Request Moderation**: Review and approve/reject wholesale applications

### Analytics Dashboard
- **Performance Metrics**: Track total wholesalers, orders, and revenue
- **Time-Based Comparison**: Compare performance across custom date ranges
- **Top Performers**: View top 10 wholesale customers and best-selling products
- **Growth Indicators**: See percentage changes compared to previous periods

### Requirements Display
- **Progress Tracking**: Show customers their progress toward wholesale pricing
- **Conditional Display**: Appears in mini-cart, cart, and checkout
- **Block Integration**: Add requirement widgets to any page

All source code, including unminified JS/CSS, is publicly available here:
[https://github.com/YayCommerce/YayWholesale](https://github.com/YayCommerce/YayWholesale)

## Installation

1. Upload the plugin files to `/wp-content/plugins/yay-wholesale/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Navigate to YayWholesale in your WordPress admin to configure settings
4. A default wholesale role will be created automatically upon activation

## Getting Started

### Setting Up Registration
1. Go to **YayWholesale > Settings > Registration**
2. Configure moderation settings and form messages
3. Customize registration fields under **Registration Fields**
4. Add the registration form to a page using:
   - Shortcode: `[ywhs_request_form title="optional"]`
   - Block: "Request Registration Form Block"

### Creating Wholesale Roles
1. Navigate to **YayWholesale > Roles**
2. Click "Add New Role" to create custom wholesale tiers
3. Configure pricing and requirements for each role

### Managing Requests
1. View pending requests at **YayWholesale > Requests**
2. Review customer information and approve or reject applications
3. Assign specific roles during approval if needed

### Configuring Prices
1. Go to **YayWholesale > Settings > Display**
2. Choose your price display format
3. Customize the wholesale price label
4. Select a color for wholesale pricing

### Customizing Emails
Configure automated email notifications:

- New wholesale order placed (to admin)
- New wholesale account registered (to admin)
- Wholesale account approved (to customer)
- Wholesale account rejected (to customer)
- Wholesale account pending review (to customer)

## Frequently Asked Questions

**Can customers have multiple wholesale roles?**
No, each wholesaler is assigned one role at a time. Approving a new request overrides the previous role.

**What happens to pending requests after approval?**
Approved requests are removed from the Requests screen and the customer appears in the Wholesalers list.

**Can I disable the default role?**
No, the default role cannot be deactivated or deleted. It always appears first in the roles list.

**Do wholesale orders calculate taxes?**
You can enable/disable tax calculations for wholesale orders in Settings > General.

**Can wholesalers use coupons?**
You can enable/disable coupon functionality for wholesale orders in Settings > General.

## Support

For documentation, support, and updates, visit our website or [contact YayCommerce support team](http://yaycommerce.com/support/).

## Changelog

= Mar 24, 2026 - Version 1.0.6 =
- Improved: Registration fields setting
- Improved: Registration form mechanic

= Mar 17, 2026 - Version 1.0.5 =
- Fixed: Bugs from admin notice
- Updated: Requirements progress bar (Pro version)

= Mar 13, 2026 – Version 1.0.4 =
- Updated: Plugin logo in admin dashboard
- Improved: Recommended plugins screen
- Improved: Licenses screen (Pro version)

= Feb 25, 2026 - Version 1.0.3 =
- Implement YayUIKits to Admin UI

= Jan 29, 2026 - Version 1.0.2 =
- Update permission callback for API
- Implement submission rate limit for wholesale submit form
- Refactor plugin prefix

= Jan 12, 2026 - Version 1.0.0 =
- Initial release
