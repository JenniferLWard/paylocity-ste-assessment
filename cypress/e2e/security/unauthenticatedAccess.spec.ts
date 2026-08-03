import { loginPageSelectors } from "../../support/pages/loginPage";

describe("invalidLogin", { tags: "@smoke" }, () => {
  it("rejects login with an invalid password", () => {
    cy.clearCookies();
    cy.visit("/Account/Login");
    loginPageSelectors.userNameInput().type(Cypress.env("username"));
    loginPageSelectors.passwordInput().type("WrongPassword123!");
    loginPageSelectors.loginCTA().click();
    cy.getCookie(".AspNetCore.Cookies").should("not.exist");
    loginPageSelectors.loginValidationError().should("be.visible");
  });

  it("rejects login with an unrecognized username", () => {
    cy.clearCookies();
    cy.visit("/Account/Login");
    loginPageSelectors.userNameInput().type("NotARealUser999");
    loginPageSelectors.passwordInput().type(Cypress.env("password"));
    loginPageSelectors.loginCTA().click();
    cy.getCookie(".AspNetCore.Cookies").should("not.exist");
    loginPageSelectors.loginValidationError().should("be.visible");
  });
});
