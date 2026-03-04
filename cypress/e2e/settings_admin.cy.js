describe("Suite 8: Settings (RegTech Admin)", () => {
    // Context: RegTech Admin Portal
    // Role: Super Admin (jossyojih@gmail.com)
    let selectors;

    before(() => {
        cy.fixture('selector-map.json').then((map) => {
            selectors = map.settings;
        });
    });

    beforeEach(() => {
        // cy.login("super_admin");
        cy.visit('/');
    });

    // TC-SET-01: Industry Propagation
    it("TC-SET-01: Dynamic Industry Propagation Logic", () => {
        const testIndustry = `AutoTest_${Date.now()}`;
        // 1. Create Industry
        cy.get(selectors.industry.addButton).click();
        cy.get(selectors.industry.nameInput).type(testIndustry);
        cy.get(selectors.industry.saveButton).click();

        // 2. Verify on Client Side/Selection List
        cy.visit('/onboarding');
        cy.get(selectors.onboarding.industrySelect).should('contain', testIndustry);
    });

    // TC-SET-02: Hierarchy
    it("TC-SET-02: Multi-level Org Hierarchy Persistence", () => {
        // 1. Create Parent Dept
        cy.get(selectors.hierarchy.addDeptButton).click();
        cy.get(selectors.hierarchy.inputField).type('Operations Dept');
        cy.get(selectors.hierarchy.saveButton).click();

        // 2. Create Child Team under Parent
        cy.get(selectors.hierarchy.addTeamButton).click();
        cy.get(selectors.hierarchy.parentSelect).select('Operations Dept');
        cy.get(selectors.hierarchy.inputField).type('Logistics Team');
        cy.get(selectors.hierarchy.saveButton).click();

        // 3. Verify Persistence after reload
        cy.reload();
        cy.get(selectors.hierarchy.treeView).should('contain', 'Operations Dept').and('contain', 'Logistics Team');
    });

    // TC-SET-03: User Provisioning
    it("TC-SET-03: User Role Provisioning & Validation", () => {
        const testUser = `qa_test_${Date.now()}@regtech.com`;
        cy.get(selectors.users.inviteButton).click();
        cy.get(selectors.users.emailInput).type(testUser);
        cy.get(selectors.users.roleSelect).select('Internal Auditor');
        cy.get(selectors.users.submitButton).click();

        cy.get(selectors.users.table).should('contain', testUser).and('contain', 'Internal Auditor');
    });

    // TC-SET-04: Conditional Filtering
    it("TC-SET-04: Functional Service-Industry Filtering", () => {
        // Check dynamic behavior of service list based on selected industry
        cy.get(selectors.filters.industrySelect).select('Financial Industry');
        cy.get(selectors.filters.serviceList).should('contain', 'AML');

        cy.get(selectors.filters.industrySelect).select('Manufacturing');
        cy.get(selectors.filters.serviceList).should('not.contain', 'AML').and('contain', 'Safety Audit');
    });

    // TC-SET-05: Deletion Safeguard
    it("TC-SET-05: Administrative Logic Gate (Deletions)", () => {
        // 1. Attempt to Delete protected entity
        cy.get(selectors.hierarchy.activeDeptRow).find(selectors.common.deleteButton).click();

        // 2. Verify Blocked via UI Warning
        cy.get(selectors.common.modalWarning).should('be.visible').and('contain', 'active teams');
    });
});
