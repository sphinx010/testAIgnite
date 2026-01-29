/**
 * MODAL ACTIONS
 * 
 * Abstractions for interacting with overlay components.
 * 
 * @usage
 * import { closeModal } from "../support/actions/modals.actions";
 * closeModal("modals.commonCloseBtn");
 */

import "../commands";

export const closeModal = (closeBtnSelectorKey) => {
  cy.getSelector(closeBtnSelectorKey).click();
};

export const assertModalVisible = (selectorKey) => {
  cy.getSelector(selectorKey).should("be.visible");
};
