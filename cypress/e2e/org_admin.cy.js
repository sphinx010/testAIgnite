describe("Suite 3: Org Admin (Client Portal)", () => {
    // Context: Client Portal
    // Role: Org Admin (fundverse@mailinator.com)

    beforeEach(() => {
        cy.visit('/login');
        cy.wait(1000)
    });
    let userRoles, invalidSecrets
    before(() => {
        // Load test data from environment config
        const envConfig = Cypress.env('envConfig');
        userRoles = envConfig.roles;
        invalidSecrets = envConfig.invalid
    })

    let appDashboard, signIn
    let audits
    before(() => {
        cy.fixture('selector-map.json').as('selectorMap') // load data from users.json
        cy.get('@selectorMap').then((selectorMap) => {
            appDashboard = selectorMap.dashboard
            signIn = selectorMap.auth.signIn
            audits = selectorMap.dashboard.audits

        })
    });

    it('Harvest selectors -  Dasboard page', () => {

        //   cy.harvestDOM({ folder: 'dashboard', fileName: 'org_admin_harvest.json' });
    });

    // TC-ORG-01: Dashboard Overview
    it("TC-ORG-01: Dashboard Overview Loads successfully", () => {
        // login
        cy.intercept('POST', '**/auth/**').as('loginRequest')
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click();
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);
        //check for dashboard visibility
        cy.contains('Dashboard').should('be.visible', { timeout: 10000 });
    });

    // TC-OA-01: Click on compliance and peruse audit list
    it("TC-OA-01: Click on compliance and peruse audit list", () => {
        // Login flow
        cy.intercept('POST', '**/auth/**').as('loginRequest')
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click();
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);

        // 1. Navigate to Compliance Module (Audit)
        cy.contains(appDashboard.sidebar.complianceBtn).click({ timeout: 60000 });
        // 2. click on audit 
        cy.contains(appDashboard.sidebar.audits[0], appDashboard.sidebar.audits[1]).click({ timeout: 60000 });

        // 3. Verify that the full audit panel loads
        cy.contains(audits.frameWorkProgress[0], audits.frameWorkProgress[1]).should('be.visible', { timeout: 60000 });
        cy.contains(audits.auditCount[0], audits.auditCount[1]).should('be.visible', { timeout: 60000 });
        cy.contains(audits.upcomingAudits[0], audits.upcomingAudits[1]).should('be.visible', { timeout: 60000 });
        cy.contains(audits.recentAuditsPanel[0], audits.recentAuditsPanel[1]).should('be.visible', { timeout: 60000 });
        cy.contains(audits.recentAuditsPanelData[0]).should('be.visible', { timeout: 60000 });
        cy.contains(audits.recentAuditsPanelData[1]).should('be.visible', { timeout: 60000 });
        cy.contains(audits.recentAuditsPanelData[2]).should('be.visible', { timeout: 60000 });
        cy.contains(audits.recentAuditsPanelData[3]).should('be.visible', { timeout: 60000 });
        cy.contains(audits.recentAuditsPanelData[4]).should('be.visible', { timeout: 60000 });
        //navigate audit panel states: Overview, Active, Completed 
        cy.contains(audits.overview[0], audits.overview[1]).click();
        cy.contains(audits.overview[1]).should('be.visible', { timeout: 60000 });
        cy.contains(audits.ongoingAudits[0], audits.ongoingAudits[1]).should('be.visible', { timeout: 60000 });
        cy.contains(audits.active[0], audits.active[1]).click();
        cy.contains(audits.active[1]).should('be.visible', { timeout: 60000 });
        cy.contains(audits.activeAuditsAssertion).should('be.visible', { timeout: 60000 });
        cy.contains(audits.completed[0], audits.completed[1]).click();
        cy.contains(audits.completed[1]).should('be.visible', { timeout: 60000 });
        cy.contains(audits.completedAuditsAssertion).should('be.visible', { timeout: 60000 });
    });

    // TC-OA-02: Functional Tab Partitioning
    it("TC-OA-02: [FUNCTIONAL] Test search feature functionality[No reliable selector found]", () => {
        // Login flow
        cy.intercept('POST', '**/auth/**').as('loginRequest')
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click();
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);

        // 1. Navigate to Compliance Module (Audit)
        cy.contains(appDashboard.sidebar.complianceBtn).click({ timeout: 60000 });
        // 2. click on audit 
        cy.contains(appDashboard.sidebar.audits[0], appDashboard.sidebar.audits[1]).click({ timeout: 60000 });

        // 3. type in existing frameworks in the search bar, expect suggestions, or a search result on clicking enter
        cy.get(audits.search[0]).should('include', audits.search[1], { timeout: 60000 });
        cy.get('table tbody tr').its('length').then((beforeCount) => {
            cy.get(audits.search[0]).type('ISO/IEC 27001{enter}');

            // Assert table filtered down
            cy.get('table tbody tr:visible').should('have.length.lessThan', beforeCount);

            // Assert only relevant records remain
            cy.get('table tbody tr:visible').each(($el) => {
                cy.wrap($el).should('contain', 'ISO/IEC 27001', { timeout: 60000 });
            });
        });

        // 2. Check Completed Tab
        cy.contains('button', 'Completed').click();
        cy.get('table tbody tr').each(($row) => {
            cy.wrap($row).should('contain', 'Completed');
        });
    });

    // TC-OA-03: Filter by status: All status, Request, Ongoing, Completed, Declined, Approved
    it("TC-OA-03: [FUNCTIONAL] Filter by status: All status, Request, Ongoing, Completed, Declined, Approved", () => {
        // Login flow
        cy.intercept('POST', '**/auth/**').as('loginRequest')
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click({ timeout: 60000 });
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);

        // 1. Navigate to Compliance Module (Audit)
        cy.contains(appDashboard.sidebar.complianceBtn).click({ timeout: 60000 });
        // 2. click on audit 
        cy.contains(appDashboard.sidebar.audits[0], appDashboard.sidebar.audits[1]).click({ timeout: 60000 });

        // 2. click on filter box
        cy.get(audits.filterBox).click({ force: true, timeout: 60000 });
        // 3. click on filter options
        cy.wrap(audits.auditsFilter).each((status) => {
            // Re-open/click the filter box
            cy.get(audits.filterBox).click({ force: true, timeout: 60000 });
            // Click the specific status from your list
            cy.contains(status).click({ force: true });
            //we check that the UI actually updated
            cy.get(audits.filterBox).should('contain.text', status);
        })

        // 2. Verify Redirection & Pre-population
        cy.url().should('include', '/create');
        cy.get('input[name="organization"]').should('have.value', 'FundVerse');
    });

    // TC-OA-04: Pagination & Record Offset Accuracy
    it("TC-OA-04: Pagination & Record Offset Accuracy", () => {
        // Login flow
        cy.intercept('POST', '**/auth/**').as('loginRequest')
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click();
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);

        // 1. Navigate to Compliance Module (Audit)
        cy.contains(appDashboard.sidebar.complianceBtn).click({ timeout: 60000 });
        // 2. click on audit 
        cy.contains(appDashboard.sidebar.audits[0], appDashboard.sidebar.audits[1]).click({ timeout: 60000 });

        // 1. Capture first record ID on Page 1
        cy.get('table tbody tr').first().invoke('text').then((firstPageText) => {
            // 2. Click Next Page
            cy.get('button[aria-label*="Next"]').click();

            // 3. Verify data is different (Offset working)
            cy.get('table tbody tr').first().invoke('text').should('not.equal', firstPageText);

            // 4. Verify Previous button is now active
            cy.get('button[aria-label*="Previous"]').should('not.be.disabled');
        });
    });

    // TC-OA-05: Summary Card Data Integrity
    it("TC-OA-05: Summary Card Data Integrity", () => {
        // Login flow
        cy.intercept('POST', '**/auth/**').as('loginRequest')
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click();
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);

        // 1. Get count from Dashboard Card
        cy.getSelector('dashboard.summaryCards.activeAudits').invoke('text').then((cardCount) => {
            const count = parseInt(cardCount.replace(/\D/g, ""));

            // 2. Navigate to Table
            cy.getSelector('dashboard.sidebar.complianceBtn').click();
            cy.contains('button', 'Active').click();

            // 3. Compare with table row count
            cy.get('table tbody tr').should('have.length', count);
        });
    });
});
