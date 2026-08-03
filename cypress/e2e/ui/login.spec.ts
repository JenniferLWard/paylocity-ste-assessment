import { benefitsDashboardPageSelectors } from "../../support/pages/benefitsDashboardPage";

describe("Login", { tags: "@smoke" }, () => {
  it("should allow a user with valid credentials to log in", () => {
    cy.env(["username", "password"]).then((creds) => {
      cy.loginBenefitsPage(creds.username, creds.password);
      cy.visit("/Benefits");
      benefitsDashboardPageSelectors.employeeTable().should("be.visible");
    });
  });
});
