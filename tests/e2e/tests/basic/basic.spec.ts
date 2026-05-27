import { expect, test } from "../../fixtures/fixtures";

import { admin } from "../../test-data/data";
import { logIn } from "../../utils/login";

test("load the home page", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByText(/powered by WordPress/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "WordPress" })).toBeVisible();
});

test("load wp-admin as admin", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("./wp-admin");
  await logIn(page, admin.username, admin.password);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("YayWholesale plugin is active", async ({ page }) => {
  await page.goto("./wp-admin/plugins.php");
  await expect(
    page.getByText("Yay Wholesale B2B for WooCommerce"),
  ).toBeVisible();
});
