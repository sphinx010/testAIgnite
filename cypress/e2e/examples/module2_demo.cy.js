import { clickButton } from "../../support/actions/buttons.actions";
import { getBaseUrl } from "../../support/config/env";

/**
 * MODULE 2 DEMO: Selector Intelligence & CTA Abstraction
 * 
 * This test demonstrates the 'Design-to-Code' approach where:
 * 1. Intent is defined in the test (What we want to do).
 * 2. Selectors are abstracted in selector-map.json (Where it is).
 * 3. Interactions are handled by Action files (How we do it).
 */

describe("Module 2 Demo: Selector-as-Data Pattern", () => {
    beforeEach(() => {
        // getBaseUrl() resolves the environment-specific URL from Module 3.
        cy.visit(getBaseUrl());
    });

    it("interacts with elements using logical keys instead of raw selectors", () => {
        // ❌ WRONG: cy.get('h1').should('contain', 'Example Domain')
        // ✅ RIGHT: Using the logical key 'example.heading' from selector-map.json
        cy.getSelector("example.heading").should("be.visible").and("contain.text", "Example Domain");

        // ❌ WRONG: cy.get('a').click()
        // ✅ RIGHT: Using a high-level action with a logical key
        clickButton("example.moreInfoLink");

        // Assert the final state
        cy.url().should("include", "iana.org/domains/example");
    });
});
