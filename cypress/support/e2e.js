import 'cypress-mochawesome-reporter/register';
import "./commands";
// Actions are ES modules; tests import what they need. No global side effects required.

Cypress.on('uncaught:exception', (err, runnable) => {
    // Ignore hydration errors in Next.js/React that don't affect functional testing
    if (err.message.includes('Minified React error #418') || err.message.includes('hydration')) {
        return false;
    }
    // Let other errors fail the tests
    return true;
});
