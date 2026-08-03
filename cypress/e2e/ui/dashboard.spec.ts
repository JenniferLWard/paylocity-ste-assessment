import { benefitsDashboardPageSelectors } from "../../support/pages/benefitsDashboardPage";
import * as uiFunctions from "../../support/utils/uiFunctions";
import { faker } from "@faker-js/faker";

const firstName = faker.person.firstName();
const lastName = faker.person.lastName();
const dependents = faker.number.int({ min: 0, max: 32 }).toString();

describe("Benefits Dashboard", { tags: "@smoke" }, () => {
  let userID: string;
  beforeEach(() => {
    cy.clearCookies();
    cy.env(["username", "password"]).then((creds) => {
      cy.loginBenefitsPage(creds.username, creds.password);
      cy.visit("/Benefits");
    });
  });
  it("displays the employee table with correct headers", () => {
    benefitsDashboardPageSelectors.employeeTable().should("be.visible");
    benefitsDashboardPageSelectors.employeeTableHeaderRow().within(() => {
      cy.contains("Id").should("be.visible");
      cy.contains("Last Name").should("be.visible");
      cy.contains("First Name").should("be.visible");
      cy.contains("Dependents").should("be.visible");
      cy.contains("Salary").should("be.visible");
      cy.contains("Gross Pay").should("be.visible");
      cy.contains("Benefits Cost").should("be.visible");
      cy.contains("Net Pay").should("be.visible");
      cy.contains("Actions").should("be.visible");
    });
  });
  it("displays existing employee data in the table", () => {
    benefitsDashboardPageSelectors
      .employeeTableBodyRow()
      .should("have.length.greaterThan", 0);
  });

  it("adds a new employee and confirms that they are displayed in the table", () => {
    benefitsDashboardPageSelectors.addEmployeeCTA().click();
    benefitsDashboardPageSelectors.addEmployeeModal().should("be.visible");
    benefitsDashboardPageSelectors.addFirstNameInput().type(firstName);
    benefitsDashboardPageSelectors.addLastNameInput().type(lastName);
    benefitsDashboardPageSelectors.addDependentsInput().type(dependents);
    uiFunctions.getEmployeeDetails(
      `POST`,
      benefitsDashboardPageSelectors.addEmployeeSubmitCTA,
    );
    cy.get("@userID").then((id: string) => {
      userID = String(id);
    });
    uiFunctions.confirmNewEmployeeAdded(firstName, lastName, dependents);
    benefitsDashboardPageSelectors
      .employeeTableBodyRow()
      .should("contain", firstName)
      .and("contain", lastName)
      .and("contain", dependents);
    // This is checking the display of the benefits cost in the table and rounding as the table does. The actual calculations are checked in the next test.
    uiFunctions.confirmEmployeeBenefitsTable(dependents);
  });

  it("confirms that an employee can be edited", () => {
    uiFunctions.editOrDeleteEmployeeByUserID(
      userID,
      benefitsDashboardPageSelectors.editEmployeeCTA,
    );
    benefitsDashboardPageSelectors.addEmployeeModal().should("be.visible");
    const newDependents =
      dependents === "0" ? "1" : (parseInt(dependents) + 1).toString();
    benefitsDashboardPageSelectors
      .addDependentsInput()
      .clear()
      .type(newDependents);
    uiFunctions.getEmployeeDetails(
      `PUT`,
      benefitsDashboardPageSelectors.updateEmployeeSubmitCTA,
    );
    cy.reload();
    uiFunctions.confirmNewEmployeeAdded(firstName, lastName, newDependents);
    uiFunctions.confirmEmployeeBenefitsTable(newDependents);
  });

  it("confirms that an employee can be deleted", () => {
    uiFunctions.editOrDeleteEmployeeByUserID(
      userID,
      benefitsDashboardPageSelectors.deleteEmployeeCTA,
    );
    benefitsDashboardPageSelectors.deleteEmployeeModal().should("be.visible");
    benefitsDashboardPageSelectors
      .deleteTextFirstName()
      .should("contain", firstName);
    benefitsDashboardPageSelectors.deleteModalSubmitCTA().click();
    cy.reload();
    benefitsDashboardPageSelectors
      .employeeTableBodyRow()
      .should("not.contain", firstName);
  });
});
