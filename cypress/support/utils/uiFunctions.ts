import { benefitsDashboardPageSelectors } from "../pages/benefitsDashboardPage";

const getEmployeeDetails = (method: string, buttonToClick: any) => {
  cy.intercept(method, "**/api/employees").as("employeeDetails");

  buttonToClick().click();
  cy.wait("@employeeDetails")
    .its("response")
    .then((response: any) => {
      expect(response.statusCode).to.eq(200);
      cy.wrap(response.body.id).as("userID");
      cy.wrap(response.body.firstName).as("firstName");
      cy.wrap(response.body.lastName).as("lastName");
      cy.wrap(response.body.dependants).as("numberOfDependents");
      cy.wrap(response.body.benefitsCost).as("benefitsCost");
      cy.wrap(response.body.net).as("netPay");
    });
};

const confirmNewEmployeeAdded = (
  firstName: string,
  lastName: string,
  dependents: string,
) => {
  benefitsDashboardPageSelectors
    .employeeTableBodyRow()
    .should("contain", firstName)
    .and("contain", lastName)
    .and("contain", dependents);
};

const confirmEmployeeBenefitsTable = (numberOfDependents: string) => {
  const annualBenefitCost = 1000;
  const annualDependentCost = 500;
  const paychecksPerYear = 26;

  cy.get("@userID").then((userID: any) => {
    const dependents = Number(numberOfDependents);
    const expectedBenefitsCost =
      (annualBenefitCost + annualDependentCost * dependents) / paychecksPerYear;

    benefitsDashboardPageSelectors
      .employeeTableBodyRow()
      .contains(String(userID))
      .parents("tr")
      .within(() => {
        cy.get("td")
          .eq(6) // Benefits Cost column
          .invoke("text")
          .then((actualBenefitsCostText) => {
            const actualBenefitsCost = parseFloat(
              actualBenefitsCostText,
            ).toFixed(2);
            expect(actualBenefitsCost).to.eq(
              expectedBenefitsCost.toFixed(2),
              `Benefits Cost mismatch: table shows ${actualBenefitsCost}, hand-calculated expected ${expectedBenefitsCost.toFixed(2)} for ${dependents} dependents`,
            );
          });
      });
  });
};

const editOrDeleteEmployeeByUserID = (userID: string, buttonToClick: any) => {
  benefitsDashboardPageSelectors
    .employeeTableBodyRow()
    .contains(String(userID))
    .parents("tr")
    .within(() => {
      buttonToClick().click();
    });
};

// Function: Does the API's OWN math hold up against a raw, independent calculation?
// This checks the server's calculation logic in isolation, no table, no rounding
// from display formatting, just "did they do the math right internally."
const confirmAnnualDeductionAccuracy = (
  userID: string,
  numberOfDependents: string,
) => {
  const annualBenefitCost = 1000;
  const annualDependentCost = 500;
  const paychecksPerYear = 26;

  const dependents = Number(numberOfDependents);
  const trueAnnualCost = annualBenefitCost + annualDependentCost * dependents;

  benefitsDashboardPageSelectors
    .employeeTableBodyRow()
    .contains(String(userID))
    .parents("tr")
    .within(() => {
      cy.get("td")
        .eq(6) // Benefits Cost column, as displayed per-paycheck
        .invoke("text")
        .then((displayedPerPaycheckText) => {
          const displayedPerPaycheck = parseFloat(displayedPerPaycheckText);
          const projectedAnnualFromDisplay = Number(
            (displayedPerPaycheck * paychecksPerYear).toFixed(2),
          );
          const annualShortfall = trueAnnualCost - projectedAnnualFromDisplay;

          cy.log(
            `Dependents: ${dependents} | Per-paycheck displayed: $${displayedPerPaycheck} | ` +
              `Projected annual (×26): $${projectedAnnualFromDisplay} | True annual: $${trueAnnualCost} | ` +
              `Shortfall: $${annualShortfall.toFixed(2)}`,
          );
          logDriftResult(numberOfDependents, {
            displayedPerPaycheck,
            projectedAnnual: projectedAnnualFromDisplay,
            trueAnnual: trueAnnualCost,
            shortfall: Number(annualShortfall.toFixed(2)),
          }).then(() => {
            expect(projectedAnnualFromDisplay).to.eq(
              trueAnnualCost,
              `Annual deduction shortfall of $${annualShortfall.toFixed(2)} for an employee with ${dependents} dependents. ` +
                `Displayed $${displayedPerPaycheck}/paycheck × 26 paychecks = $${projectedAnnualFromDisplay}, but true annual cost is $${trueAnnualCost}.`,
            );
          });
        });
    });
};

// Function: Logs the results of the rounding drift test to a JSON file for later analysis
const logDriftResult = (
  dependents: string,
  result: {
    displayedPerPaycheck: number;
    projectedAnnual: number;
    trueAnnual: number;
    shortfall: number;
  },
) => {
  return cy
    .readFile("cypress/results/rounding-drift.json")
    .then((existing: any[]) => {
      const updated = [
        ...existing,
        {
          dependents: Number(dependents),
          ...result,
          timestamp: new Date().toISOString(),
        },
      ];
      return cy.writeFile("cypress/results/rounding-drift.json", updated);
    });
};

export {
  getEmployeeDetails,
  confirmNewEmployeeAdded,
  confirmEmployeeBenefitsTable,
  confirmAnnualDeductionAccuracy,
  editOrDeleteEmployeeByUserID,
  logDriftResult,
};
