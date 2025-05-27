import { defineConfig } from "@playwright/test";

const PORT = process.env.PORT || 3001;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: "*.@(spec|e2e).?(c|m)[jt]s?(x)",
  timeout: 10 * 1000,
  expect: {
    timeout: 3 * 1000,
  },
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    port: 3001,
    reuseExistingServer: true,
  },
});
