import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { BenefitsDashboardPage } from "../../../support/pages/benefitsDashboardPage";
import { attachApiAuthHeader } from "../../../support/apiAuth";
import * as uiFunctions from "../../../support/utils/uiFunctions";

const firstName = faker.person.firstName();
const lastName = faker.person.lastName();
const dependents = faker.number.int({ min: 0, max: 32 }).toString();

test.describe("Benefits Dashboard", { tag: "@smoke" }, () => {
  test.describe.configure({ mode: "serial" });

  let userID: string;

  test.beforeEach(async ({ page }) => {
    await attachApiAuthHeader(page);
    const dashboard = new BenefitsDashboardPage(page);
    await dashboard.goto();
  });

  test("displays the employee table with correct headers", async ({ page }) => {
    const dashboard = new BenefitsDashboardPage(page);
    await expect(dashboard.employeeTable).toBeVisible();

    for (const header of [
      "Id",
      "Last Name",
      "First Name",
      "Dependents",
      "Salary",
      "Gross Pay",
      "Benefits Cost",
      "Net Pay",
      "Actions",
    ]) {
      await expect(dashboard.employeeTableHeaderRow).toContainText(header);
    }
  }); // <-- closes cleanly here now

  test("displays existing employee data in the table", async ({ page }) => {
    const dashboard = new BenefitsDashboardPage(page);
    await expect(dashboard.employeeTableBodyRow.first()).toBeVisible();
    const rowCount = await dashboard.employeeTableBodyRow.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("shows the Add Employee button", async ({ page }) => {
    const dashboard = new BenefitsDashboardPage(page);
    await expect(dashboard.addEmployeeCTA).toBeVisible();
  });

  test("adds a new employee and confirms that they are displayed in the table", async ({
    page,
  }) => {
    const dashboard = new BenefitsDashboardPage(page);

    await dashboard.addEmployeeCTA.click();
    await expect(dashboard.addEmployeeModal).toBeVisible();
    await dashboard.addFirstNameInput.fill(firstName);
    await dashboard.addLastNameInput.fill(lastName);
    await dashboard.addDependentsInput.fill(dependents);

    const details = await uiFunctions.getEmployeeDetails(
      page,
      "POST",
      dashboard.addEmployeeSubmitCTA(),
    );
    userID = details.userID;

    await uiFunctions.confirmNewEmployeeAdded(
      dashboard,
      firstName,
      lastName,
      dependents,
    );
    await uiFunctions.confirmEmployeeBenefitsTable(
      dashboard,
      userID,
      dependents,
    );
  });

  test("confirms that an employee can be edited", async ({ page }) => {
    const dashboard = new BenefitsDashboardPage(page);

    await dashboard.editButtonForRow(userID).click();
    await expect(dashboard.addEmployeeModal).toBeVisible();

    const newDependents =
      dependents === "0" ? "1" : (parseInt(dependents) + 1).toString();
    await dashboard.addDependentsInput.fill(newDependents);

    await uiFunctions.getEmployeeDetails(
      page,
      "PUT",
      dashboard.updateEmployeeSubmitCTA,
    );

    await page.reload();
    await uiFunctions.confirmNewEmployeeAdded(
      dashboard,
      firstName,
      lastName,
      newDependents,
    );
    await uiFunctions.confirmEmployeeBenefitsTable(
      dashboard,
      userID,
      newDependents,
    );
  });

  test("confirms that an employee can be deleted", async ({ page }) => {
    const dashboard = new BenefitsDashboardPage(page);

    await dashboard.deleteButtonForRow(userID).click();
    await expect(dashboard.deleteEmployeeModal).toBeVisible();
    await expect(dashboard.deleteTextFirstName).toContainText(firstName);

    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/employees") &&
          res.request().method() === "DELETE",
      ),
      dashboard.deleteModalSubmitCTA.click(),
    ]);

    await page.reload();
    await expect(
      dashboard.employeeTableBodyRow.filter({ hasText: firstName }),
    ).toHaveCount(0);
  });
});
