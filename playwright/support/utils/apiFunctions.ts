import { APIRequestContext } from "@playwright/test";

const apiRequest = async (
  request: APIRequestContext,
  method: string,
  path: string,
  data?: object,
) => {
  return request.fetch(path, {
    method,
    data,
    headers: {
      Authorization: `Basic ${process.env.TEST_AUTH_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
};

export { apiRequest };
