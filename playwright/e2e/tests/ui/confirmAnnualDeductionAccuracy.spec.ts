import { test } from "@playwright/test";
import * as fs from "fs";
import { BenefitsDashboardPage } from "../../../support/pages/benefitsDashboardPage";
import {
  getEmployeeDetails,
  confirmAnnualDeductionAccuracy,
} from "../../../support/utils/uiFunctions";
import { apiRequest } from "../../../support/utils/apiFunctions";
import { attachApiAuthHeader } from "../../../support/apiAuth";

// Assertion is expected to fail: documents a confirmed rounding defect.
// See: https://app.notion.com/p/Benefits-Cost-rounding-causes-annual-deduction-shortfall-per-paycheck-rounding-before-multiplicatio-3b03d6e9d6f780fa8051d5d166d6b3c8?source=copy_link
const dependentCountsToTest = ["0", "1", "3", "4", "13", "32"];
const resultsPath = "playwright/results/rounding-drift.jsonl";
const finalResultsPath = "playwright/results/rounding-drift.json";
const createdEmployeeIDs: string[] = [];

test.describe(
  "Annual deduction accuracy - rounding drift",
  { tag: "@regression" },
  () => {
    test.beforeEach(async ({ page }) => {
      await attachApiAuthHeader(page);
    });

    for (const dependentCount of dependentCountsToTest) {
      test(`confirms annual deduction accuracy for an employee with ${dependentCount} dependents`, async ({
        page,
      }) => {
        const dashboard = new BenefitsDashboardPage(page);
        await dashboard.goto();

        await dashboard.addEmployeeCTA.click();
        await dashboard.addFirstNameInput.fill("Rounding");
        await dashboard.addLastNameInput.fill(`Drift${dependentCount}`);
        await dashboard.addDependentsInput.fill(dependentCount);

        const details = await getEmployeeDetails(
          page,
          "POST",
          dashboard.addEmployeeSubmitCTA(),
        );
        createdEmployeeIDs.push(details.userID);

        await confirmAnnualDeductionAccuracy(
          dashboard,
          details.userID,
          dependentCount,
        );
      });
    }

    test.afterAll(async ({ request }) => {
      const lines = fs
        .readFileSync(resultsPath, "utf-8")
        .trim()
        .split("\n")
        .filter(Boolean);
      const combined = lines.map((line) => JSON.parse(line));
      fs.writeFileSync(finalResultsPath, JSON.stringify(combined, null, 2));
      fs.unlinkSync(resultsPath); // delete the scratch .jsonl file that keeps concurrent writes safe, keep only the clean .json
      for (const id of createdEmployeeIDs) {
        await apiRequest(request, "DELETE", `api/employees/${id}`);
      }
    });
  },
);
