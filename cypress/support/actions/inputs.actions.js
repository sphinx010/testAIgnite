/**
 * INPUT ACTIONS
 * 
 * Robust typing interactions including clearing and visibility checks.
 * 
 * @usage
 * import { typeInput } from "../support/actions/inputs.actions";
 * typeInput("auth.username", "testuser");
 */

import "../commands";

export const typeInput = (selectorKey, text, options = {}) => {
  cy.getSelector(selectorKey, options).should("be.visible");
  cy.getSelector(selectorKey, options).clear();
  cy.getSelector(selectorKey, options).type(text, { delay: 0, ...options });
};
