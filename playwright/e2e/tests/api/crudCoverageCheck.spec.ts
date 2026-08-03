import { test, expect } from "@playwright/test";
import { apiRequest } from "../../../support/utils/apiFunctions";

test.describe(
  "Employees API - CRUD endpoint coverage",
  { tag: "@regression" },
  () => {
    test.describe.configure({ mode: "serial" });
    let createdId: string;

    test("POST /api/Employees creates an employee", async ({ request }) => {
      const res = await apiRequest(request, "POST", "api/employees", {
        firstName: "Crud",
        lastName: "Coverage",
        username: `crudCoverage${Date.now()}`,
        dependants: 1,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("id");
      expect(body.firstName).toBe("Crud");
      createdId = body.id;
    });

    test("GET /api/Employees returns the employee list", async ({
      request,
    }) => {
      const res = await apiRequest(request, "GET", "api/employees");
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test("GET /api/Employees/{id} returns a single employee", async ({
      request,
    }) => {
      const res = await apiRequest(
        request,
        "GET",
        `api/employees/${createdId}`,
      );
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.id).toBe(createdId);
    });

    test("PUT /api/Employees updates an employee", async ({ request }) => {
      const res = await apiRequest(request, "PUT", "api/employees", {
        id: createdId,
        firstName: "Crud",
        lastName: "Updated",
        username: `crudCoverage${Date.now()}`,
        dependants: 2,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.lastName).toBe("Updated");
    });

    test("DELETE /api/Employees/{id} deletes an employee", async ({
      request,
    }) => {
      const res = await apiRequest(
        request,
        "DELETE",
        `api/employees/${createdId}`,
      );
      expect(res.status()).toBe(200);
    });

    // This will fail until the following bug ticket is resolved: https://app.notion.com/p/Invalid-Authorization-token-returns-500-Internal-Server-Error-instead-of-401-Unauthorized-3b13d6e9d6f78029b8a9f54f31541adc?source=copy_link
    test("rejects a request with an invalid auth token", async ({
      request,
    }) => {
      const res = await request.get("api/employees", {
        headers: { Authorization: "Basic invalidtoken123" },
      });
      expect(res.status()).toBe(401);
    });
  },
);
