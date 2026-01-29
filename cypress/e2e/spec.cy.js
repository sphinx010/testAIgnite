import { clickButton } from "../support/actions/buttons.actions";
import { getBaseUrl } from "../support/config/env";

describe("Smoke (CTA-centric): example.com", () => {
  it("opens the more info link via selector registry", () => {
    cy.visit(getBaseUrl());
    cy.getSelector("example.heading").should("contain.text", "Example Domain");
    clickButton("example.moreInfoLink");
    cy.url().should("include", "iana.org/domains/example");
  });
});

describe("Intentional failure scenarios for AI enrichment", () => {
  it("fails when expected CTA text is missing", () => {
    cy.visit(getBaseUrl());
    // Intentionally assert wrong heading text to create a deterministic failure
    cy.getSelector("example.heading").should("contain.text", "Nonexistent Heading");
  });

  it("fails on unreachable endpoint status check", () => {
    cy.visit(getBaseUrl());
    cy.request({ url: "/does-not-exist", failOnStatusCode: false }).then((resp) => {
      expect(resp.status).to.eq(200); // purposely wrong to fail
    });
  });

});
