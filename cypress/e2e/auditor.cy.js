describe("Suite 5: Auditor (Audit Firm Portal)", () => {
    // Context: Audit Firm Portal
    // Role: Auditor (auditorjames@mailinator.com)
    let selectors;

    before(() => {
        cy.fixture('selector-map.json').then((map) => {
            selectors = map.auditor;
        });
    });

    beforeEach(() => {
        // cy.login("auditor");
        cy.visit('/');
    });

    // TC-AUR-01: Dashboard Data
    it("TC-AUR-01: Dashboard Data Accuracy (Functional Sync)", () => {
        // 1. Get Summary Count from Dashboard Card
        cy.get(selectors.dashboard.summaryCardCount).invoke('text').then((cardText) => {
            const summaryCount = parseInt(cardText);

            // 2. Compare with Table Row Count
            cy.get(selectors.dashboard.auditTableRows).should('have.length', summaryCount);
        });
    });

    // TC-AUR-02: Navigation
    it("TC-AUR-02: Functional Navigation to Audit Workspace", () => {
        // 1. Click Audit Card
        cy.get(selectors.dashboard.auditCard).first().click();

        // 2. Verify Url and Workspace Header
        cy.url().should('contain', '/audit-workspace/');
        cy.get(selectors.workspace.header).should('be.visible');
    });

    // TC-AUR-03: Evidence Review
    it("TC-AUR-03: Evidence Review & Retrieval", () => {
        // Navigate to workspace and open evidence
        cy.get(selectors.dashboard.auditCard).first().click();
        cy.get(selectors.workspace.evidenceLink).first().click();

        // Assert the file opens or initiates download
        cy.get(selectors.workspace.documentViewer).should('be.visible');
    });

    // TC-AUR-04: Scoring
    it("TC-AUR-04: Scoring Logic & Persistence", () => {
        // 1. Open Question and select score
        cy.get(selectors.dashboard.auditCard).first().click();
        cy.get(selectors.workspace.scoringDropdown).select('Compliant');
        cy.get(selectors.workspace.saveButton).click();

        // 2. Reload & Verify Persistence
        cy.reload();
        cy.get(selectors.workspace.scoringDropdown).should('have.value', 'Compliant');
    });

    // TC-AUR-05: Progress Calculation
    it("TC-AUR-05: Dynamic Progress Calculation", () => {
        // Answer a question and verify the progress bar percentage updates
        cy.get(selectors.workspace.progressIndicator).invoke('text').then((initialPct) => {
            const startVal = parseFloat(initialPct);

            cy.get(selectors.workspace.unansweredQuestion).first().click();
            cy.get(selectors.workspace.scoringDropdown).select('Compliant');

            cy.get(selectors.workspace.progressIndicator).invoke('text').should((newPct) => {
                expect(parseFloat(newPct)).to.be.greaterThan(startVal);
            });
        });
    });
});
