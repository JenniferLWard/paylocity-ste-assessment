import { Page, Locator } from "@playwright/test";

export class BenefitsDashboardPage {
  readonly page: Page;
  readonly employeeTable: Locator;
  readonly employeeTableHeaderRow: Locator;
  readonly employeeTableBodyRow: Locator;
  readonly addEmployeeCTA: Locator;
  readonly addEmployeeModal: Locator;
  readonly addFirstNameInput: Locator;
  readonly addLastNameInput: Locator;
  readonly addDependentsInput: Locator;

  readonly editEmployeeCTA: Locator;
  readonly updateEmployeeSubmitCTA: Locator;
  readonly deleteEmployeeCTA: Locator;
  readonly deleteEmployeeModal: Locator;
  readonly deleteTextFirstName: Locator;
  readonly deleteModalSubmitCTA: Locator;

  constructor(page: Page) {
    this.page = page;
    this.employeeTable = page.locator("#employeesTable");
    this.employeeTableHeaderRow = page.locator("#employeesTable thead tr");
    this.employeeTableBodyRow = page.locator("#employeesTable tbody tr");
    this.addEmployeeCTA = page.locator("#add");
    this.addEmployeeModal = page.locator("#employeeModal");
    this.addFirstNameInput = page.locator("#firstName");
    this.addLastNameInput = page.locator("#lastName");
    this.addDependentsInput = page.locator("#dependants");
    this.editEmployeeCTA = page.locator(".fa-edit");
    this.updateEmployeeSubmitCTA = page.locator("#updateEmployee");
    this.deleteEmployeeCTA = page.locator(".fa-times");
    this.deleteEmployeeModal = page.locator("#deleteModal");
    this.deleteTextFirstName = page.locator("#deleteFirstName");
    this.deleteModalSubmitCTA = page.locator("#deleteEmployee");
  }

  async goto() {
    await this.page.goto("Benefits");
  }

  addEmployeeSubmitCTA(): Locator {
    return this.page.getByRole("button", { name: "Add", exact: true });
  }

  rowByEmployeeId(employeeId: string): Locator {
    return this.employeeTableBodyRow.filter({ hasText: employeeId });
  }

  editButtonForRow(employeeId: string): Locator {
    return this.rowByEmployeeId(employeeId).locator(".fa-edit");
  }

  deleteButtonForRow(employeeId: string): Locator {
    return this.rowByEmployeeId(employeeId).locator(".fa-times");
  }

  benefitsCostCellForRow(employeeId: string): Locator {
    return this.rowByEmployeeId(employeeId).locator("td").nth(6);
  }
}
