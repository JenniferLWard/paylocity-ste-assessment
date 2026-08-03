export const loginPageSelectors = {
  userNameInput() {
    return cy.getSel(["id", "Username", ""]);
  },

  passwordInput() {
    return cy.getSel(["id", "Password", ""]);
  },

  loginCTA() {
    return cy.getSel(["type", "submit", ""]).contains("Log In");
  },

  loginValidationError() {
    return cy.getSel(["class", "text-danger", "~"]);
  },
};
