# TestAIgnite: Enterprise Quality Assurance Framework

[![Cypress Automation CI](https://github.com/sphinx010/testAIgnite/actions/workflows/cypress.yml/badge.svg)](https://github.com/sphinx010/testAIgnite/actions/workflows/cypress.yml)

##  Live Build Status & Insights

| Test Distribution | Reflective CI Status |
| :---: | :---: |
| ![Test Distribution](https://sphinx010.github.io/testAIgnite/charts/failures.svg) | ![CI Status](https://sphinx010.github.io/testAIgnite/charts/ci_list.svg) |

> **Last Updated:** [Dynamic via GitHub Pages]

TestAIgnite is a robust, AI-powered automation framework designed to provide high-quality testing through stable design patterns and automated analysis. This framework ensures that software remains reliable while providing clear, actionable insights when issues occur.

## Framework Intent and Purpose

The primary goal of TestAIgnite is to solve the common problems of traditional automation:
1. Brittle Tests: Tests that fail because of minor visual changes rather than actual bugs.
2. Complicated Maintenance: High effort required to update tests when the application changes.
3. Difficult Diagnostics: Wasting time trying to understand why a test failed.

TestAIgnite addresses these by separating the "intent" of a test from the "technical details" of the application, and by using Artificial Intelligence to diagnose failures automatically.

## Getting Started

### Installation
To set up the framework on your local machine, run:
```bash
npm install
```

### Running the Automation
Environments are isolated per run. Choose an env file from `cypress/config/*.env.json` (e.g., `landing`, `admin`, `audit-firm`, `client`, `prod`, `staging`). If no environment is provided, Cypress will throw to prevent accidental cross-environment leakage.

- Run a full suite with AI analysis for one environment (example: landing):
  ```bash
  set CYPRESS_ENVIRONMENT=landing && npm run report:full   # PowerShell/CMD
  # or
  npm run cy:run -- --env environment=landing
  npm run ai:ignite
  npm run report:html
  ```

- Run all environments in one command (outputs saved under `cypress/reports_by_env/<env>/`):
  ```bash
  npm run report:full:all
  ```
  To target a subset, pass env names: `node scripts/runAllEnvs.js landing admin`.

- Perform AI Diagnostic Analysis without rerunning tests:
  ```bash
  npm run ai:ignite
  ```

- View the Results Report:
  ```bash
  npm run report:open
  ```

## Design Patterns and System Logic

### Module 2: Selector Intelligence (The Central Registry)
it employs a clean and clear pattern in the use of selectors in tests, as they stored modularly.

How it works:
1. Define the selector in `cypress/fixtures/selector-map.json`:
```json
{
  "loginPage": {
    "usernameField": "#user-id-input",
    "submitButton": ".btn-primary-blue"
  }
}
```

2. Use the logical name in your test:
```javascript
// The framework finds "#user-id-input" automatically via the key
cy.getSelector("loginPage.usernameField").type("my-username");
```

Impact: If a developer changes the button color or ID, you only update the JSON file once. Your tests remain untouched.

### Module 3: Environment Intelligence (Multi-Site Testing)
The framework automatically adjusts its behavior based on whether you are testing on Development, Staging, or Production.

How it works:
1. Configuration is stored in environment files (e.g., `cypress/config/staging.env.json`):
```json
{
  "baseUrl": "https://staging.ourapp.com",
  "roles": {
    "admin": { "email": "admin@staging.com", "password": "pass" }
  }
}
```

2. Access settings in your test without hardcoding:
```javascript
import { getBaseUrl } from "../support/config/env";
import { getCredentials } from "../support/config/auth";

it("performs an admin login", () => {
  cy.visit(getBaseUrl()); // Automatically goes to the staging URL
  const creds = getCredentials("admin"); // Fetches staging-specific credentials
  cy.getSelector("loginPage.usernameField").type(creds.email);
});
```

### Action Abstraction (Standardized Interactions)
We group common tasks into "Actions" so that multiple tests can reuse the same logic.

How it works:
Standardized code in `cypress/support/actions/buttons.actions.js`:
```javascript
export const clickButton = (selectorKey) => {
  cy.getSelector(selectorKey)
    .should("be.visible")
    .and("not.be.disabled")
    .click();
};
```

Usage in a test:
```javascript
import { clickButton } from "../support/actions/buttons.actions";

it("submits the form", () => {
  clickButton("loginPage.submitButton"); // Handles visibility and click logic automatically
});
```

## How to Work with the Framework

### Writing a Complete Test
A standard test combines these patterns to create a script that reads like a set of instructions.

```javascript
import { clickButton } from "../support/actions/buttons.actions";
import { typeInput } from "../support/actions/inputs.actions";
import { getBaseUrl } from "../support/config/env";

describe("User Authentication Flow", () => {
  it("should allow a user to log in successfully", () => {
    // 1. Technical detail (URL) is handled by Environment Intelligence
    cy.visit(getBaseUrl());

    // 2. Interaction is handled by Action Abstraction
    // 3. Selection is handled by Selector Intelligence
    typeInput("loginPage.usernameField", "test_user");
    typeInput("loginPage.passwordField", "secure_password");
    clickButton("loginPage.loginButton");

    // 4. Verification Check
    cy.url().should("include", "/dashboard");
  });
});
```

## Use Cases and Stakeholder Interaction

- Stakeholders: Can read the test files to understand business requirements without needing to understand CSS or HTML.
- Automation Engineers: Can build new tests rapidly by reusing existing Actions and Selectors.
- Quality Analysts: Use the AI Diagnostics to identify if a failure is a real bug or a temporary environment issue.
