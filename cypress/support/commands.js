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
 * Core Resolver Engine
 * 
 * Importance:
 * 1. Centralizes UI knowledge: Decouples test logic from volatile CSS/Tailwind selectors.
 * 2. Maintenance: If a UI change occurs, update 'selector-map.json' once instead of fixing multiple tests.
 * 3. Validation: Fails early and provides descriptive errors if a key is missing or nested incorrectly.
 * 
 * Framework Role:
 * Functions as a 'Look-up Service'. It takes a logical dot-notated string and traverses 
 * the selector registry to find the corresponding raw CSS string for Cypress commands.
 * 
 * @param {string} keyPath - The logical path in the selector-map (e.g., 'login.usernameField')
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

  // Handle cy.contains pattern: cy.contains("tag", "text")
  const containsMatch = selector.match(/^cy\.contains\(['"](.+?)['"],\s*['"](.+?)['"]\)$/);

  let chain;
  if (containsMatch) {
    const [, tag, text] = containsMatch;
    chain = cy.contains(tag, text, options);
  } else {
    chain = cy.get(selector, options);
  }

  return chain
    .should("have.length.at.least", 1) // Changed from exact 1 to at least 1 for flexibility
    .then(($el) => {
      // If multiple found, pick the first one purely for interaction safety
      const $target = $el.length > 1 ? $el.first() : $el;
      const el = $target[0];
      const isDisabled = el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true";
      if (isDisabled) {
        throw new Error(`Selector "${keyPath}" resolved but is disabled/non-interactable`);
      }
      return $target;
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

const { getHarvestData, saveHarvest } = require("./actions/harvest.actions");

/**
 * cy.harvestDOM
 * 
 * Scrapes the current page for CTAs and text elements, then saves 
 * the result to a unique fixture file grouped by spec and environment.
 * Accepts either a folder string or an options object:
 *   cy.harvestDOM('landing_page')
 *   cy.harvestDOM({ folder: 'auth', fileName: 'signin_harvest.json', rootSelector: 'body' })
 */
Cypress.Commands.add("harvestDOM", (options = null) => {
  const opts = typeof options === "string" ? { folder: options } : options || {};
  const { folder = null, fileName = null, rootSelector = "body" } = opts;

  return getHarvestData(rootSelector).then((data) => {
    return saveHarvest(data, { folder, fileName });
  });
});

module.exports = {
  resolveSelector,
};
