import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly userNameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginCTA: Locator;
  readonly loginValidationError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userNameInput = page.locator("#Username");
    this.passwordInput = page.locator("#Password");
    this.loginCTA = page.locator('button[type="submit"]');
    this.loginValidationError = page.locator('[class~="text-danger"]');
  }

  async goto() {
    await this.page.goto(process.env.UI_LOGIN_URL || "Account/Login");
  }

  async login(username: string, password: string) {
    await this.userNameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginCTA.click();
  }
}
