import { test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto(process.env.UI_LOGIN_URL || "/Account/Login");
  await page.locator('input[name="Username"]').fill(process.env.TEST_USERNAME!);
  await page.locator('input[name="Password"]').fill(process.env.TEST_PASSWORD!);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("**/Benefits");
  await page.context().storageState({ path: authFile });
});
