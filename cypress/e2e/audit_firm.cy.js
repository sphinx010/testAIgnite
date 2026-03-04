describe("Suite 7: Audit Firm (Firm Admin)", () => {
    // Context: Audit Firm Portal
    // Role: Firm Admin (finguard@mailinator.com)
    let selectors;

    before(() => {
        cy.fixture('selector-map.json').then((map) => {
            selectors = map;
        });
    });

    beforeEach(() => {
        cy.visit('/');
    });

    let appDashboard, signIn
    let audits
    let taskManagement
    before(() => {
        cy.fixture('selector-map.json').as('selectorMap')
        cy.get('@selectorMap').then((selectorMap) => {
            appDashboard = selectorMap.dashboard
            signIn = selectorMap.auth.signIn
            audits = selectorMap.dashboard.audits
            taskManagement = selectorMap.dashboard.actions.taskManagement
        })
    });

    let user, invalidSecrets
    before(() => {
        // Load test data from environment config
        const envConfig = Cypress.env('envConfig');
        user = Cypress.env('testUsers') ? Cypress.env('testUsers').newUser : { email: 'organa@mailinator.com', password: 'Password@20267' };
        invalidSecrets = Cypress.env('testData') ? Cypress.env('testData').invalidEmails : [];
    })

    // Test 1: Login Validation
    it('1. Should login successfully and display the Dashboard', () => {
        cy.get('#email').clear().type('organa@mailinator.com'); // Using specific creds provided
        cy.get('#password').clear().type('Password@20267');
        cy.contains('button', 'Login').click();

        // Success Anchor: 'Recent Activity' list appears on Dashboard
        cy.contains('Recent Activity', { timeout: 15000 }).should('be.visible');
    });

    // Test 2: Task State Verification
    it('2. Should navigate to Tasks and assert empty state', () => {
        // Assume logged in via session or subsequent step, for safety, relogin in this block if no session setup exists yet
        cy.get('#email').clear().type('organa@mailinator.com');
        cy.get('#password').clear().type('Password@20267');
        cy.contains('button', 'Login').click();

        // Navigate to Tasks
        cy.contains('Tasks').click();

        // Success Anchor: 'No tasks assigned' text is visible
        cy.contains('No tasks assigned', { timeout: 15000 }).should('be.visible');
    });

    // Test 3: Team Management (Invite & View Auditor)
    it('3. Should manage team by locating Invite button and viewing an Auditor', () => {
        cy.get('#email').clear().type('organa@mailinator.com');
        cy.get('#password').clear().type('Password@20267');
        cy.contains('button', 'Login').click();

        // Navigate to Teams
        cy.contains('Teams').click();

        // Wait for 'Invite Auditor' button and Auditor Name column header (or list) to appear
        cy.contains('button', 'Invite Auditor', { timeout: 15000 }).should('be.visible');

        // Check for table render by looking for column header
        cy.contains('th', 'Auditor Name', { matchCase: false, timeout: 10000 }).should('be.visible');

        // Click the 'Invite Auditor' button
        cy.contains('button', 'Invite Auditor').click();

        // Assert modal appears (look for common modal elements, like an email input or title)
        cy.get('input[type="email"]', { timeout: 5000 }).should('be.visible'); // Form appears for email input

        // Close modal (assuming standard behavior, pressing Esc or clicking a cancel button)
        cy.get('body').type('{esc}');

        // Click the 'eye' icon next to an auditor (Assuming Eye icon sits in an SVG or button holding 'View')
        // Using robust selection strategy: Find the table row containing "Auditor Two" (if exists, or first row) and click its view button
        cy.get('tbody tr').first().within(() => {
            // Find a button that might contain an eye icon, or specifically has an aria-label or specific class.
            // Assuming fallback to an element containing SVG if no explicit text exists
            cy.get('button, a').find('svg').first().click();
        });

        // Redirection to Auditor profile page (Assert URL change or Profile text)
        cy.url().should('include', '/auditor'); // Heuristic assumption about URL routing
    });

    // Test 4: Audit Campaign Flow (CBN Audits) with full form simulation
    it('4. Should complete the Audit Campaign (CBN Audits) invitation flow', () => {
        cy.get('#email').clear().type('organa@mailinator.com');
        cy.get('#password').clear().type('Password@20267');
        cy.contains('button', 'Login').click();

        // Navigate to CBN Audits
        cy.contains('CBN Audits').click();

        // Assert 'Audit Campaign Intelligence' card is visible
        cy.contains('Audit Campaign Intelligence', { timeout: 15000 }).should('be.visible');

        // Locate tabs
        cy.contains('Dashboard').should('be.visible');
        cy.contains('Invited Organizations').should('be.visible');

        // Click 'Invite Org'
        cy.contains('button', 'Invite Org').click();

        // Fill out "Registration" & "Add Audit" simulation (using heuristic selectors for form fields)
        cy.get('input[name="organizationName"], input[placeholder*="Organization"]').first().type('Test Org AIgnite');
        cy.get('input[type="email"]').first().type('testorg@example.com');

        // Check the necessary boxes in Registration/Add Audit sections
        cy.contains('label', 'Open Banking').click(); // Clicking label usually toggles checkbox robustly
        cy.contains('label', 'Agile Methodology').click();

        // Click the "invite & set up audit" button
        cy.contains('button', 'invite & set up audit', { matchCase: false }).click();

        // Pop-up confirmation modal shows "Confirm Invitation"
        cy.contains('Confirm Invitation', { timeout: 5000 }).should('be.visible');

        // Click on "confirm & send" button
        cy.contains('button', 'confirm & send', { matchCase: false }).click();

        // Assert success message briefly appears at bottom right (Toast notification)
        cy.contains('invitation being sent successfully', { matchCase: false, timeout: 10000 }).should('be.visible');

        // Verify redirection back to the CBN Audits dashboard
        cy.contains('Audit Campaign Intelligence', { timeout: 15000 }).should('be.visible');
    });

});
