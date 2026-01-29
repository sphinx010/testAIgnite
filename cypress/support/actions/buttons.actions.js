/**
 * BUTTON ACTIONS
 * 
 * Standardized click interactions with safety checks.
 * 
 * @usage
 * import { clickButton } from "../support/actions/buttons.actions";
 * clickButton("example.moreInfoLink");
 */

import "../commands";

export const clickButton = (selectorKey, options = {}) => {
  cy.getSelector(selectorKey, options)
    .should("be.visible")
    .and("not.be.disabled")
    .click();
};
