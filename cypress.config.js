const { defineConfig } = require("cypress");
const { merge } = require("lodash");
const path = require("path");
const fs = require("fs");

const reporterOptions = {
  reportDir: "cypress/reports",
  charts: false,
  overwrite: false,
  html: false,
  json: true,
  reportFilename: "results",
  inlineAssets: false,
  embeddedScreenshots: true,
  saveAllAttempts: true,
  saveJson: true
};

module.exports = defineConfig({
  reporter: "cypress-mochawesome-reporter",
  reporterOptions,
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.js",
    screenshotsFolder: "cypress/reports/screenshots",
    videosFolder: "cypress/reports/videos",
    supportFile: "cypress/support/e2e.js",
    baseUrl: "https://example.com",
    setupNodeEvents(on, config) {
      require("cypress-mochawesome-reporter/plugin")(on);

      // Safety: ensure no HTML artifacts are left if reporter ignores html:false
      on("after:run", () => {
        const reportDir = reporterOptions.reportDir || "cypress/reports";
        const fullDir = path.join(__dirname, reportDir);
        if (fs.existsSync(fullDir)) {
          fs.readdirSync(fullDir)
            .filter((f) => f.toLowerCase().endsWith(".html"))
            .forEach((f) => fs.unlinkSync(path.join(fullDir, f)));
        }
      });
      // --- MODULE 3: Environment & Configuration Loading ---
      // This block dynamically loads settings from cypress/config/*.env.json
      // based on the 'environment' flag passed via CLI or defaults to 'dev'.

      const envName = config.env.environment || process.env.CYPRESS_ENVIRONMENT || "dev";
      const envPath = path.join(__dirname, "cypress", "config", `${envName}.env.json`);

      if (!fs.existsSync(envPath)) {
        throw new Error(`Environment file not found: ${envPath}`);
      }

      const fileConfig = JSON.parse(fs.readFileSync(envPath, "utf-8"));

      // Override Precedence: 
      // 1. CLI arguments (e.g., --env baseUrl=...) 
      // 2. Environment JSON file
      const mergedEnv = merge({}, fileConfig, config.env);

      // Map merged configuration to internal Cypress properties
      config.env.envConfig = mergedEnv;
      config.baseUrl = mergedEnv.baseUrl || config.baseUrl;
      config.env.apiBaseUrl = mergedEnv.apiBaseUrl || config.env.apiBaseUrl;

      return config;
    }
  }
});
