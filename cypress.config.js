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
    video: true,
    videoCompression: 32,
    supportFile: "cypress/support/e2e.js",
    baseUrl: null, //
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 80000,
    pageLoadTimeout: 120000,
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
      // --- M3: Environment & Configuration Loading ---
      // This block dynamically loads settings from cypress/config/*.env.json
      // based on the 'environment' flag passed via CLI or defaults to 'dev'.

      // Support both --env environment=auth-demo AND --env auth-demo
      let envName = config.env.environment || process.env.CYPRESS_ENVIRONMENT;

      if (!envName) {
        const availableEnvs = fs.readdirSync(path.join(__dirname, "cypress", "config"))
          .filter(f => f.endsWith(".env.json") && f !== "secrets.env.json")
          .map(f => f.replace(".env.json", ""));

        envName = Object.keys(config.env).find(k => availableEnvs.includes(k)) || "dev";
      }

      const envPath = path.join(__dirname, "cypress", "config", `${envName}.env.json`);

      if (!fs.existsSync(envPath)) {
        throw new Error(`Environment file not found: ${envPath}`);
      }

      const fileConfig = JSON.parse(fs.readFileSync(envPath, "utf-8"));

      // Dynamically filter spec files based on the environment config
      if (fileConfig.specPattern) {
        config.specPattern = fileConfig.specPattern;
      }

      // Load global secrets with error handling
      const secretsPath = path.join(__dirname, "cypress", "config", "secrets.env.json");
      let secretsConfig = {};
      try {
        if (fs.existsSync(secretsPath)) {
          const fileContent = fs.readFileSync(secretsPath, "utf-8").trim();
          if (fileContent) {
            secretsConfig = JSON.parse(fileContent);
            console.log("🔐 Loaded secrets keys:", Object.keys(secretsConfig));
          } else {
            console.warn("⚠️ secrets.env.json exists but is empty. Skipping.");
          }
        }
      } catch (err) {
        console.error("❌ Failed to parse secrets.env.json:", err.message);
      }

      // Override Precedence: 
      // 1. CLI arguments (e.g., --env baseUrl=...) 
      // 2. Environment JSON file
      const mergedEnv = merge({}, fileConfig, secretsConfig, config.env);

      // Map merged configuration to internal Cypress properties
      config.env.ENV_NAME = envName;

      // Spread the mergedEnv into config.env for direct access
      config.env = { ...config.env, ...mergedEnv, envConfig: mergedEnv };
      config.baseUrl = mergedEnv.baseUrl || config.baseUrl;
      config.env.apiBaseUrl = mergedEnv.apiBaseUrl || config.env.apiBaseUrl;

      console.log(`\n>>> CYPRESS CONFIGURATION LOADED <<<`);
      console.log(`Environment: ${envName}`);
      console.log(`Base URL:    ${config.baseUrl}`);
      console.log(`API Base:    ${config.env.apiBaseUrl}`);
      console.log(`Spec Pattern: ${config.specPattern}\n`);

      return config;
    }
  }
});
