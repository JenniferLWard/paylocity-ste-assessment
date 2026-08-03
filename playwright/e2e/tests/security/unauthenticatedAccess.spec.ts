import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../support/pages/loginPage";

test.describe("Login", { tag: "@smoke" }, () => {
  test("rejects login with an invalid password", async ({ page, context }) => {
    await context.clearCookies();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.TEST_USERNAME!, "WrongPassword123!");
    await expect(loginPage.loginValidationError).toBeVisible();
    const sessionCookie = (await context.cookies()).find(
      (c) => c.name === ".AspNetCore.Cookies",
    );
    expect(sessionCookie).toBeUndefined();
  });
});

// This test fails due to open bug (https://app.notion.com/p/Login-with-an-unrecognized-username-returns-405-Method-Not-Allowed-and-a-broken-error-page-while-an-3af3d6e9d6f780a29735dcac5f5c5481?source=copy_link)
test.describe("Login - unrecognized username", { tag: "@regression" }, () => {
  test("rejects login with an unrecognized username", async ({
    page,
    context,
  }) => {
    await context.clearCookies();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("NotARealUser999", process.env.TEST_PASSWORD!);
    await expect(loginPage.loginValidationError).toBeVisible();
    const sessionCookie = (await context.cookies()).find(
      (c) => c.name === ".AspNetCore.Cookies",
    );
    expect(sessionCookie).toBeUndefined();
  });
});
