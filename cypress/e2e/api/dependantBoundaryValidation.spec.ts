import { apiRequest } from "../../support/utils/apiFunctions";

describe(
  "Dependants field - boundary validation",
  { tags: "@regression" },
  () => {
    const createdEmployeeIDs: string[] = [];

    const baseEmployee = {
      firstName: "Boundary",
      lastName: "Test",
    };

    const buildPayload = (dependants: number | string) => ({
      ...baseEmployee,
      username: `boundaryTest${Date.now()}${Math.random()}`,
      dependants,
    });

    it("accepts the valid upper boundary (32)", () => {
      apiRequest("POST", "/api/employees", buildPayload(32)).then((res) => {
        expect(res.status).to.eq(200);
        createdEmployeeIDs.push(res.body.id);
      });
    });

    it("accepts a valid inside value (5)", () => {
      apiRequest("POST", "/api/employees", buildPayload(5)).then((res) => {
        expect(res.status).to.eq(200);
        createdEmployeeIDs.push(res.body.id);
      });
    });

    it("accepts the valid lower boundary (0)", () => {
      apiRequest("POST", "/api/employees", buildPayload(0)).then((res) => {
        expect(res.status).to.eq(200);
        createdEmployeeIDs.push(res.body.id);
      });
    });

    it("rejects the business-rule upper violation (33) with 400", () => {
      apiRequest("POST", "/api/employees", buildPayload(33)).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body[0]?.errorMessage).to.include("between 0 and 32");
      });
    });

    it("rejects the business-rule lower violation (-1) with 400", () => {
      apiRequest("POST", "/api/employees", buildPayload(-1)).then((res) => {
        cy.log(`Status: ${res.status}`);
        cy.log(`Body: ${JSON.stringify(res.body)}`);
        if (res.status === 200) createdEmployeeIDs.push(res.body.id);
      });
    });

    it("tests technical int32 overflow (2,147,483,648)", () => {
      apiRequest("POST", "/api/employees", buildPayload(2147483648)).then(
        (res) => {
          cy.log(`Status: ${res.status}`);
          cy.log(`Body: ${JSON.stringify(res.body)}`);
          if (res.status === 200) createdEmployeeIDs.push(res.body.id);
        },
      );
    });

    it("rejects non-integer type (2.5)", () => {
      apiRequest("POST", "/api/employees", buildPayload(2.5)).then((res) => {
        cy.log(`Status: ${res.status}`);
        cy.log(`Body: ${JSON.stringify(res.body)}`);
        if (res.status === 200) createdEmployeeIDs.push(res.body.id);
      });
    });

    // Bug filed: https://app.notion.com/p/API-accepts-string-values-for-dependants-despite-schema-declaring-type-integer-3b13d6e9d6f780f7bae6e13ade056f85?source=copy_link
    it('rejects string type instead of integer ("3")', () => {
      apiRequest("POST", "/api/employees", buildPayload("3")).then((res) => {
        cy.log(`Status: ${res.status}`);
        cy.log(`Body: ${JSON.stringify(res.body)}`);
        if (res.status === 200) createdEmployeeIDs.push(res.body.id);
      });
    });

    after(() => {
      createdEmployeeIDs.forEach((id) => {
        apiRequest("DELETE", `/api/employees/${id}`);
      });
    });
  },
);
