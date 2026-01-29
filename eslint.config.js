const cypress = require("eslint-plugin-cypress");

module.exports = [
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      "coverage",
      "cypress/reports",
      "cypress/screenshots",
      "cypress/videos"
    ]
  },
  {
    // Base from plugin:cypress/recommended
    ...cypress.configs.recommended,
    rules: {
      ...cypress.configs.recommended.rules,
      "no-console": "warn",
      "cypress/no-force": "warn",
      "cypress/no-unnecessary-waiting": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "prefer-const": "warn"
    }
  }
];
