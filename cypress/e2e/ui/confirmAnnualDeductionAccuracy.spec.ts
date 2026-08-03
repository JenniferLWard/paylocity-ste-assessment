import { benefitsDashboardPageSelectors } from "../../support/pages/benefitsDashboardPage";
import * as uiFunctions from "../../support/utils/uiFunctions";
import { apiRequest } from "../../support/utils/apiFunctions";

const dependentCountsToTest = ["0", "1", "3", "4", "13", "32"];
const createdEmployeeIDs: string[] = [];

// This test is expected to fail: documents a confirmed rounding defect.
// See: https://app.notion.com/p/Benefits-Cost-rounding-causes-annual-deduction-shortfall-per-paycheck-rounding-before-multiplicatio-3b03d6e9d6f780fa8051d5d166d6b3c8?source=copy_link
describe(
  "Annual deduction accuracy - rounding drift",
  { tags: "@regression" },
  () => {
    before(() => {
      cy.writeFile("cypress/results/rounding-drift.json", []);
    });
    beforeEach(() => {
      cy.clearCookies();
      cy.env(["username", "password"]).then((creds) => {
        cy.loginBenefitsPage(creds.username, creds.password);
        cy.visit("/Benefits");
      });
    });
    dependentCountsToTest.forEach((dependentCount) => {
      it(`confirms annual deduction accuracy for an employee with ${dependentCount} dependents`, () => {
        benefitsDashboardPageSelectors.addEmployeeCTA().click();
        benefitsDashboardPageSelectors.addFirstNameInput().type("Rounding");
        benefitsDashboardPageSelectors
          .addLastNameInput()
          .type(`Drift${dependentCount}`);
        benefitsDashboardPageSelectors
          .addDependentsInput()
          .type(dependentCount);

        uiFunctions.getEmployeeDetails(
          `POST`,
          benefitsDashboardPageSelectors.addEmployeeSubmitCTA,
        );

        cy.get("@userID").then((userID) => {
          createdEmployeeIDs.push(String(userID)); // track regardless of pass/fail
          uiFunctions.confirmAnnualDeductionAccuracy(
            String(userID),
            dependentCount,
          );
        });
      });
    });

    after(() => {
      createdEmployeeIDs.forEach((id) => {
        apiRequest("DELETE", `/api/employees/${id}`);
      });
    });
  },
);
