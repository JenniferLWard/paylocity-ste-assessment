import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../support/pages/loginPage";
import { BenefitsDashboardPage } from "../../../support/pages/benefitsDashboardPage";

test.describe("Login", { tag: "@smoke" }, () => {
  test("should allow a user with valid credentials to log in", async ({
    page,
    context,
  }) => {
    await context.clearCookies();

    const loginPage = new LoginPage(page);
    const dashboard = new BenefitsDashboardPage(page);

    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USERNAME!,
      process.env.TEST_PASSWORD!,
    );

    await page.waitForURL("**/Benefits");
    await expect(dashboard.employeeTable).toBeVisible();
  });
});
