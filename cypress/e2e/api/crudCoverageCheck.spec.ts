import { apiRequest } from "../../support/utils/apiFunctions";

describe(
  "Employees API - CRUD endpoint coverage",
  { tags: "@regression" },
  () => {
    let createdId: string;

    it("POST /api/Employees creates an employee", () => {
      apiRequest("POST", "/api/employees", {
        firstName: "Crud",
        lastName: "Coverage",
        username: `crudCoverage${Date.now()}`,
        dependants: 1,
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("id");
        expect(res.body.firstName).to.eq("Crud");
        createdId = res.body.id;
      });
    });

    it("GET /api/Employees returns the employee list", () => {
      apiRequest("GET", "/api/employees").then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("array");
      });
    });

    it("GET /api/Employees/{id} returns a single employee", () => {
      apiRequest("GET", `/api/employees/${createdId}`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.id).to.eq(createdId);
      });
    });

    it("PUT /api/Employees updates an employee", () => {
      apiRequest("PUT", "/api/employees", {
        id: createdId,
        firstName: "Crud",
        lastName: "Updated",
        username: `crudCoverage${Date.now()}`,
        dependants: 2,
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.lastName).to.eq("Updated");
      });
    });

    it("DELETE /api/Employees/{id} deletes an employee", () => {
      apiRequest("DELETE", `/api/employees/${createdId}`).then((res) => {
        expect(res.status).to.eq(200);
      });
    });

    // This will fail until the following bug ticket is resolved: https://app.notion.com/p/Invalid-Authorization-token-returns-500-Internal-Server-Error-instead-of-401-Unauthorized-3b13d6e9d6f78029b8a9f54f31541adc?source=copy_link
    it("rejects a request with an invalid auth token", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config("baseUrl")}/api/employees`,
        headers: { Authorization: "Basic invalidtoken123" },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  },
);
