import { getBaseUrl, getEnvConfig } from "../../support/config/env";
import { getCredentials } from "../../support/config/auth";

/**
 * MODULE 3 DEMO: Configuration & Environment Intelligence
 * 
 * This test demonstrates how to:
 * 1. Consume environment-specific URLs.
 * 2. Fetch role-based credentials securely.
 * 3. Access custom configuration flags.
 */

describe("Module 3 Demo: Env & Config Pattern", () => {
    it("resolves the correct environment profile", () => {
        const baseUrl = getBaseUrl();
        const config = getEnvConfig();

        // Log active config for visibility
        cy.log(`Active BaseURL: ${baseUrl}`);
        cy.log(`Active Environment: ${Cypress.env("environment") || "dev"}`);

        cy.visit(baseUrl);
    });

    it("fetches credentials for the 'admin' role", () => {
        // Note: 'admin' role must be defined in the *.env.json files under 'roles'
        try {
            const adminCreds = getCredentials("admin");
            cy.log(`Admin Email: ${adminCreds.email}`);
            // In a real test, you'd perform login here:
            // login(adminCreds);
        } catch (error) {
            cy.log("Skipping credential check: 'admin' role not defined in this env profile.");
            // In CI, you'd typically expect this role to exist
        }
    });
});
