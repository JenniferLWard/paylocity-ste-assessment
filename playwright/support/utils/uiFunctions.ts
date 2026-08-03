import type { Page, Locator } from "@playwright/test";
import { BenefitsDashboardPage } from "../pages/benefitsDashboardPage";
import { expect } from "@playwright/test";
import * as fs from "fs";

const resultsPath = "playwright/results/rounding-drift.jsonl";

const getEmployeeDetails = async (
  page: Page,
  method: string,
  buttonToClick: Locator,
) => {
  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes("/api/employees") &&
        res.request().method() === method,
    ),
    buttonToClick.click(),
  ]);

  expect(response.status()).toBe(200);
  const body = await response.json();

  return {
    userID: String(body.id),
    firstName: String(body.firstName),
    lastName: String(body.lastName),
    numberOfDependents: String(body.dependants),
    benefitsCost: body.benefitsCost,
    netPay: body.net,
  };
};

const confirmNewEmployeeAdded = async (
  dashboard: BenefitsDashboardPage,
  firstName: string,
  lastName: string,
  dependents: string,
) => {
  const row = dashboard.employeeTableBodyRow.filter({ hasText: firstName });
  await expect(row).toContainText(firstName);
  await expect(row).toContainText(lastName);
  await expect(row).toContainText(dependents);
};

const confirmEmployeeBenefitsTable = async (
  dashboard: BenefitsDashboardPage,
  userID: string,
  numberOfDependents: string,
) => {
  const annualBenefitCost = 1000;
  const annualDependentCost = 500;
  const paychecksPerYear = 26;

  const dependents = Number(numberOfDependents);
  const expectedBenefitsCost =
    (annualBenefitCost + annualDependentCost * dependents) / paychecksPerYear;

  const row = dashboard.rowByEmployeeId(userID);
  const actualBenefitsCostText = await dashboard
    .benefitsCostCellForRow(userID)
    .innerText();
  const actualBenefitsCost = parseFloat(actualBenefitsCostText).toFixed(2);

  expect(
    actualBenefitsCost,
    `Benefits Cost mismatch: table shows ${actualBenefitsCost}, hand-calculated expected ${expectedBenefitsCost.toFixed(2)} for ${dependents} dependents`,
  ).toBe(expectedBenefitsCost.toFixed(2));
};

const editOrDeleteEmployeeByUserID = async (
  dashboard: BenefitsDashboardPage,
  userID: string,
  buttonLocator: (row: Locator) => Locator,
) => {
  const row = dashboard.rowByEmployeeId(userID);
  await buttonLocator(row).click();
};

const confirmAnnualDeductionAccuracy = async (
  dashboard: BenefitsDashboardPage,
  userID: string,
  numberOfDependents: string,
) => {
  const annualBenefitCost = 1000;
  const annualDependentCost = 500;
  const paychecksPerYear = 26;

  const dependents = Number(numberOfDependents);
  const trueAnnualCost = annualBenefitCost + annualDependentCost * dependents;

  const row = dashboard.rowByEmployeeId(userID);
  const displayedPerPaycheckText = await row.locator("td").nth(6).innerText();
  const displayedPerPaycheck = parseFloat(displayedPerPaycheckText);
  const projectedAnnualFromDisplay = Number(
    (displayedPerPaycheck * paychecksPerYear).toFixed(2),
  );
  const annualShortfall = trueAnnualCost - projectedAnnualFromDisplay;

  console.log(
    `Dependents: ${dependents} | Per-paycheck displayed: $${displayedPerPaycheck} | ` +
      `Projected annual (×26): $${projectedAnnualFromDisplay} | True annual: $${trueAnnualCost} | ` +
      `Shortfall: $${annualShortfall.toFixed(2)}`,
  );

  logDriftResult(numberOfDependents, {
    displayedPerPaycheck,
    projectedAnnual: projectedAnnualFromDisplay,
    trueAnnual: trueAnnualCost,
    shortfall: Number(annualShortfall.toFixed(2)),
  });

  expect(
    projectedAnnualFromDisplay,
    `Annual deduction shortfall of $${annualShortfall.toFixed(2)} for an employee with ${dependents} dependents. ` +
      `Displayed $${displayedPerPaycheck}/paycheck × 26 paychecks = $${projectedAnnualFromDisplay}, but true annual cost is $${trueAnnualCost}.`,
  ).toBe(trueAnnualCost);
};

const logDriftResult = (
  dependents: string,
  result: {
    displayedPerPaycheck: number;
    projectedAnnual: number;
    trueAnnual: number;
    shortfall: number;
  },
) => {
  const entry = {
    dependents: Number(dependents),
    ...result,
    timestamp: new Date().toISOString(),
  };
  fs.appendFileSync(resultsPath, JSON.stringify(entry) + "\n");
};

export {
  getEmployeeDetails,
  confirmNewEmployeeAdded,
  confirmEmployeeBenefitsTable,
  editOrDeleteEmployeeByUserID,
  confirmAnnualDeductionAccuracy,
  logDriftResult,
};
