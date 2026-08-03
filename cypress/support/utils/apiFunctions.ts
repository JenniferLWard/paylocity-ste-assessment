const apiRequest = (method: string, path: string, body?: object) => {
  return cy.request({
    method,
    url: `${Cypress.config("baseUrl")}${path}`,
    body,
    failOnStatusCode: false,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Cypress.env("authToken")}`,
    },
  });
};

const createNewEmployee = (
  firstName: string,
  lastName: string,
  dependents: string,
) => {
  return apiRequest("POST", "/api/employees", {
    firstName,
    lastName,
    username: `${firstName}${lastName}${Date.now()}`,
    dependants: dependents,
  });
};

export { createNewEmployee, apiRequest };
