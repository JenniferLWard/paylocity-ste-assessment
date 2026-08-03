import { defineConfig } from "cypress";
import * as dotenv from "dotenv";
import { plugin as cypressGrepPlugin } from "@cypress/grep/plugin";

dotenv.config();

export default defineConfig({
  e2e: {
    baseUrl: "https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com/Prod",
    specPattern: "cypress/e2e/**/*.spec.ts",
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(on, config) {
      cypressGrepPlugin(config);
      config.env.username = process.env.TEST_USERNAME;
      config.env.password = process.env.TEST_PASSWORD;
      config.env.authToken = process.env.TEST_AUTH_TOKEN;
      return config;
    },
  },
});
