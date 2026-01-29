/**
 * TABLE ACTIONS
 * 
 * Helpers for navigating and asserting state in data tables.
 * 
 * @usage
 * import { clickTableRowByIndex } from "../support/actions/tables.actions";
 * clickTableRowByIndex("dashboard.ordersTable", 2);
 */

import "../commands";

export const clickTableRowByIndex = (tableSelectorKey, rowIndex = 0) => {
  cy.getSelector(tableSelectorKey)
    .find("tr")
    .eq(rowIndex)
    .click();
};

export const assertTableHasRows = (tableSelectorKey, min = 1) => {
  cy.getSelector(tableSelectorKey)
    .find("tr")
    .its("length")
    .should("be.at.least", min);
};
