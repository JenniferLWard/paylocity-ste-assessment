import { loginPageSelectors } from "./pages/loginPage";

declare global {
  namespace Cypress {
    type Selector = [attr: string, val: string, matchOption: string];
    interface Chainable {
      /**
       * Get DOM elements: "data-testid"
       * @param id The data-testid value
       * @param opts The Cypress options object for get. Default undefined.
       * matchOption: https://css-tricks.com/attribute-selectors/
       */
      getTestId(
        id: string,
        opts?: Partial<
          Loggable &
            Timeoutable &
            Withinable &
            Shadow & { matchOption: string } & { force: boolean }
        >,
      ): Chainable<JQuery<HTMLElement>>;

      getByTestIds(
        testIds: string[] | string,
        opts?: { timeout: number },
      ): Chainable<JQuery<Element>>;

      /**
       * Get DOM elements: selector(s) of your choice
       * @param Selector the array that contains the items below
       *
       * attr: the attribute (e.g. class, id, etc.)
       * val: the value of the attribute
       * matchOption: https://css-tricks.com/attribute-selectors/
       */
      getSel(...args: Selector[]): Chainable<JQuery<HTMLElement>>;
      dataCy(value: string): Chainable<JQuery<HTMLElement>>;
      /**
       * Custom command to log into the application via the UI, cached via cy.session().
       * @example cy.login('user@example.com', 'password')
       */
      loginBenefitsPage(username: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("getTestId", (id, options = {}) => {
  const { matchOption = "", ...opts } = options;
  return cy.get(
    `[data-testid${matchOption}="${id}"]`,
    Object.keys(opts).length ? opts : undefined,
  );
});

Cypress.Commands.add("getByTestIds", (testIds, opts) => {
  if (typeof testIds === "string") {
    return cy.get(`[data-testid~="${testIds}"]`);
  }

  const selector = testIds.map((id) => `[data-testid~="${id}"]`).join("");
  return cy.get(selector, opts);
});

Cypress.Commands.add("getSel", (...args) => {
  const argsArr: Cypress.Selector[] = [];
  argsArr.push(...args);

  const targets = argsArr.map(
    ([attr, val, match]) => `[${attr}${match}=${val}]`,
  );
  const cyReturnString = targets.join("");

  return cy.get(`${cyReturnString}`);
});

Cypress.Commands.add(
  "loginBenefitsPage",
  (username: string, password: string) => {
    cy.session(
      [username, password], // cache key, unique per credential pair
      () => {
        cy.visit("/Account/Login");
        cy.title().should("eq", "Log In - Paylocity Benefits Dashboard");
        loginPageSelectors.userNameInput().type(username);
        loginPageSelectors.passwordInput().type(password);
        loginPageSelectors.loginCTA().click();
        cy.url().should("include", "/Benefits");
      },
      {
        validate: () => {
          cy.getCookie(".AspNetCore.Cookies").should("exist");
          cy.request({
            url: "/Benefits",
            failOnStatusCode: false,
          })
            .its("status")
            .should("eq", 200);
        },
      },
    );
    cy.intercept("/Prod/api/**", (req) => {
      req.headers["Authorization"] = `Basic ${Cypress.env("authToken")}`;
    });
  },
);
export {};
