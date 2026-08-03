export const benefitsDashboardPageSelectors = {
  employeeTable() {
    return cy.getSel(["id", "employeesTable", ""]);
  },
  employeeTableHeaderRow() {
    return cy.getSel(["id", "employeesTable", ""]).find("thead tr");
  },
  employeeTableBodyRow() {
    return cy.getSel(["id", "employeesTable", ""]).find("tbody tr");
  },
  addEmployeeCTA() {
    return cy.getSel(["id", "add", ""]).contains("Add Employee");
  },
  addEmployeeModal() {
    return cy.getSel(["id", "employeeModal", ""]);
  },
  addFirstNameInput() {
    return cy.getSel(["id", "firstName", ""]);
  },
  addLastNameInput() {
    return cy.getSel(["id", "lastName", ""]);
  },
  addDependentsInput() {
    return cy.getSel(["id", "dependants", ""]);
  },
  addEmployeeSubmitCTA() {
    return cy.getSel(["id", "addEmployee", ""]);
  },
  editEmployeeCTA() {
    return cy.getSel(["class", "fa-edit", "~"]);
  },
  updateEmployeeSubmitCTA() {
    return cy.getSel(["id", "updateEmployee", ""]);
  },
  deleteEmployeeCTA() {
    return cy.getSel(["class", "fa-times", "~"]);
  },

  deleteEmployeeModal() {
    return cy.getSel(["id", "deleteModal", ""]);
  },

  deleteTextFirstName() {
    return cy.getSel(["id", "deleteFirstName", ""]);
  },

  deleteModalSubmitCTA() {
    return cy.getSel(["id", "deleteEmployee", ""]);
  },
};
