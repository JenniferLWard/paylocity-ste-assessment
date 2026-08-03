import { Page } from "@playwright/test";

export const attachApiAuthHeader = async (page: Page) => {
  await page.route("**/api/**", async (route) => {
    const headers = {
      ...route.request().headers(),
      Authorization: `Basic ${process.env.TEST_AUTH_TOKEN}`,
    };
    await route.continue({ headers });
  });
};
