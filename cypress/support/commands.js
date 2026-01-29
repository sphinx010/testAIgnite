/**
 * MODULE 2: Selector Intelligence
 * 
 * This file extends Cypress with 'Selector Intelligence'. 
 * Instead of hardcoding fragile CSS selectors in tests, we use a central registry.
 * 
 * Design Pattern: Selector-as-Data
 * Intent: Separation of UI structure and Test Logic.
 */

const selectorMap = require("../fixtures/selector-map.json");

/**
 * Internal resolver for nested selector keys.
 * @param {string} keyPath - e.g., 'login.usernameField'
 */
const resolveSelector = (keyPath) => {
  if (!keyPath || typeof keyPath !== "string") {
    throw new Error("getSelector: selector key must be a non-empty string");
  }
  const parts = keyPath.split(".");
  let current = selectorMap;
  for (const part of parts) {
    current = current?.[part];
    if (!current) break;
  }
  if (typeof current !== "string") {
    throw new Error(`getSelector: selector not found for key "${keyPath}"`);
  }
  return current;
};

/**
 * cy.getSelector
 * 
 * Resolves a key from selector-map.json and returns the Cypress element.
 * Includes built-in safety checks for visibility and interactability.
 * 
 * @example
 * cy.getSelector('login.submitButton').click()
 */
Cypress.Commands.add("getSelector", (keyPath, options = {}) => {
  const selector = resolveSelector(keyPath);
  cy.log(`Selector [${keyPath}] -> ${selector}`);
  return cy
    .get(selector, options)
    .should("have.length", 1)
    .then(($el) => {
      const el = $el[0];
      const isDisabled = el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true";
      if (isDisabled) {
        throw new Error(`Selector "${keyPath}" resolved but is disabled/non-interactable`);
      }
      return $el;
    });
});

// Optional helper: suggest stable selectors present in DOM (assistive, not for assertions).
Cypress.Commands.add("suggestSelectors", () => {
  cy.document().then((doc) => {
    const candidates = Array.from(doc.querySelectorAll("button, a, input, textarea, select")).map((el) => {
      const attrs = ["data-cy", "data-testid", "data-test", "name", "aria-label", "role"]
        .map((a) => (el.getAttribute(a) ? `${a}="${el.getAttribute(a)}"` : null))
        .filter(Boolean)
        .join(" ");
      return { tag: el.tagName.toLowerCase(), attrs, text: el.innerText?.trim().slice(0, 60) };
    });
    // eslint-disable-next-line no-console
    console.table(candidates.slice(0, 20));
  });
});

module.exports = {
  resolveSelector,
};
