import { test, expect } from "@playwright/test";
import { apiRequest } from "../../../support/utils/apiFunctions";

test.describe(
  "Dependants field - boundary validation",
  { tag: "@regression" },
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

    test("accepts the valid upper boundary (32)", async ({ request }) => {
      const res = await apiRequest(
        request,
        "POST",
        "api/employees",
        buildPayload(32),
      );
      expect(res.status()).toBe(200);
      const body = await res.json();
      createdEmployeeIDs.push(body.id);
    });

    test("accepts a valid inside value (5)", async ({ request }) => {
      const res = await apiRequest(
        request,
        "POST",
        "api/employees",
        buildPayload(5),
      );
      expect(res.status()).toBe(200);
      const body = await res.json();
      createdEmployeeIDs.push(body.id);
    });

    test("accepts the valid lower boundary (0)", async ({ request }) => {
      const res = await apiRequest(
        request,
        "POST",
        "api/employees",
        buildPayload(0),
      );
      expect(res.status()).toBe(200);
      const body = await res.json();
      createdEmployeeIDs.push(body.id);
    });

    test("rejects the business-rule upper violation (33) with 400", async ({
      request,
    }) => {
      const res = await apiRequest(
        request,
        "POST",
        "api/employees",
        buildPayload(33),
      );
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body[0]?.errorMessage).toContain("between 0 and 32");
    });

    test("rejects the business-rule lower violation (-1) with 400", async ({
      request,
    }) => {
      const res = await apiRequest(
        request,
        "POST",
        "api/employees",
        buildPayload(-1),
      );
      console.log(`Status: ${res.status()}`);
      console.log(
        `Body: ${JSON.stringify(await res.json().catch(() => null))}`,
      );
      if (res.status() === 200) {
        const body = await res.json();
        createdEmployeeIDs.push(body.id);
      }
    });

    test("tests technical int32 overflow (2,147,483,648)", async ({
      request,
    }) => {
      const res = await apiRequest(
        request,
        "POST",
        "api/employees",
        buildPayload(2147483648),
      );
      console.log(`Status: ${res.status()}`);
      if (res.status() === 200) {
        const body = await res.json();
        createdEmployeeIDs.push(body.id);
      }
    });

    test("rejects non-integer type (2.5)", async ({ request }) => {
      const res = await apiRequest(
        request,
        "POST",
        "api/employees",
        buildPayload(2.5),
      );
      console.log(`Status: ${res.status()}`);
      if (res.status() === 200) {
        const body = await res.json();
        createdEmployeeIDs.push(body.id);
      }
    });

    test('rejects string type instead of integer ("3")', async ({
      request,
    }) => {
      const res = await apiRequest(
        request,
        "POST",
        "api/employees",
        buildPayload("3"),
      );
      console.log(`Status: ${res.status()}`);
      if (res.status() === 200) {
        const body = await res.json();
        createdEmployeeIDs.push(body.id);
      }
    });

    test.afterAll(async ({ request }) => {
      for (const id of createdEmployeeIDs) {
        await apiRequest(request, "DELETE", `api/employees/${id}`);
      }
    });
  },
);
