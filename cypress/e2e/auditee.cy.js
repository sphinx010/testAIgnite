describe("Suite 4: Auditee (Client Portal)", () => {
    // Context: Client Portal
    // Role: Auditee (test.client@mailinator.com)
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
    let taskManagement
    before(() => {
        cy.fixture('selector-map.json').as('selectorMap') // load data from users.json
        cy.get('@selectorMap').then((selectorMap) => {
            appDashboard = selectorMap.dashboard
            signIn = selectorMap.auth.signIn
            audits = selectorMap.dashboard.audits
            taskManagement = selectorMap.dashboard.actions.taskManagement
        })
    });
    // TC-ORG-01: Dashboard Overview
    // TC-ORG-01: Dashboard Overview
    it("TC-AUD-01: Dashboard Overview Loads successfully", () => {
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
    it("TC-AUD-02: Click on compliance and peruse audit list", () => {
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
        
        // Defined Selectors
        const frameworkProgress = audits.frameWorkProgress;
        const auditCount = audits.auditCount;
        const upcomingAudits = audits.upcomingAudits;
        const recentAuditsPanel = audits.recentAuditsPanel;
        const recentAuditsData = audits.recentAuditsPanelData;
        const auditPanels = {
            overview: audits.overview,
            active: audits.active,
            completed: audits.completed,
            ongoing: audits.ongoingAudits
        };
        
        // 3. Verify that the full audit panel loads
        cy.contains(frameworkProgress[0], frameworkProgress[1]).should('be.visible', { timeout: 60000 });
        cy.contains(auditCount[0], auditCount[1]).should('be.visible', { timeout: 60000 });
        cy.contains(upcomingAudits[0], upcomingAudits[1]).should('be.visible', { timeout: 60000 });
        cy.contains(recentAuditsPanel[0], recentAuditsPanel[1]).should('be.visible', { timeout: 60000 });
        
        // Verify Recent Audits Data Headers
        cy.contains(recentAuditsData[0]).should('be.visible', { timeout: 60000 });
        cy.contains(recentAuditsData[1]).should('be.visible', { timeout: 60000 });
        cy.contains(recentAuditsData[2]).should('be.visible', { timeout: 60000 });
        cy.contains(recentAuditsData[3]).should('be.visible', { timeout: 60000 });
        cy.contains(recentAuditsData[4]).should('be.visible', { timeout: 60000 });
        
        //navigate audit panel states: Overview, Active, Completed 
        cy.contains(auditPanels.overview[0], auditPanels.overview[1]).click();
        cy.contains(auditPanels.overview[1]).should('be.visible', { timeout: 60000 });
        cy.contains(auditPanels.ongoing[0], auditPanels.ongoing[1]).should('be.visible', { timeout: 60000 });
        
        cy.contains(auditPanels.active[0], auditPanels.active[1]).click();
        cy.contains(auditPanels.active[1]).should('be.visible', { timeout: 60000 }).click();
        cy.contains(audits.activeAuditsAssertion).should('be.visible', { timeout: 60000 });
        
        cy.contains(auditPanels.completed[0], auditPanels.completed[1]).click();
        cy.contains(auditPanels.completed[1]).should('be.visible', { timeout: 60000 });
        cy.contains(audits.completedAuditsAssertion).should('be.visible', { timeout: 60000 });
    });

    // TC-OA-02: Functional Tab Partitioning
    it("TC-AUD-03: [FUNCTIONAL] Test search feature functionality[No reliable selector found]", () => {
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

        // Defined Selectors
        const searchBox = audits.search;

        // 3. type in existing frameworks in the search bar, expect suggestions, or a search result on clicking enter
        cy.get(searchBox[0]).should('include', searchBox[1], { timeout: 60000 });
        cy.get('table tbody tr').its('length').then((beforeCount) => {
            cy.get(searchBox[0]).type('ISO/IEC 27001{enter}');

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

    // TC-OA-03: Make New Audit Request:
    it("TC-AUD-04: [FUNCTIONAL] make new audit request", () => {
        cy.on('uncaught:exception', (err) => {
            if (err.message.includes('showPicker')) {
                return false; // Prevent Cypress from failing the test
            }
        });
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

        // Defined Selectors
        const newAuditBtn = audits.newAudit;
        const newAuditModal = audits.add_a_new_audit_box;
        const selectFramework = audits.select_Frame_Work;
        const auditTypeToggle = audits.auditTypeToggle;
        const auditClasses = audits.auditClasses;
        const auditFirmToggle = audits.auditFirmToggle;
        const chosenFirm = audits.chosen_Audit_Firm;
        const auditFirmForms = audits.auditFirmForms;
        const submitRequest = audits.submitRequest;

        // Nested/Complex Property Extraction
        const standardTag = selectFramework[2].standardTag;
        const frameworkList = selectFramework[3];
        const auditTypes = audits.auditType;

        // 2. click on the add New Audit
        cy.contains(newAuditBtn[0], newAuditBtn[1]).click();
        // 3. Assert new box actually opened;
        cy.contains(newAuditModal[1]).should('be.visible', { timeout: 60000 });
        cy.contains(selectFramework[0], selectFramework[1]).click({ timeout: 60000 });

        // Random Selection Indicies
        const random_framework_index = 10; // Keeping as previously hardcoded, or random
        const random_firm_index = Math.floor(Math.random() * chosenFirm.length);
        const random_auditType_index = Math.floor(Math.random() * auditTypes.length);
        const random_auditClass_index = Math.floor(Math.random() * auditClasses.length);
        const random_auditFirmFormat_index = Math.floor(Math.random() * auditFirmForms.length);

        // Select Framework
        cy.contains(standardTag, frameworkList[random_framework_index]).click();

        // Select Audit Type
        cy.contains(auditTypeToggle[0], auditTypeToggle[1]).click();
        cy.contains(standardTag, auditTypes[random_auditType_index]).click();

        // Select Audit Class
        const selectedAuditClass = auditClasses[random_auditClass_index];
        cy.contains(selectedAuditClass.selector, selectedAuditClass.name).click();

        // Select Audit Firm
        cy.contains(auditFirmToggle[0], auditFirmToggle[1]).click({ timeout: 60000 });
        cy.contains(standardTag, chosenFirm[random_firm_index]).click()

        // Select Audit Firm Format
        const selectedFirmFormat = auditFirmForms[random_auditFirmFormat_index];
        cy.contains(selectedFirmFormat.selector, selectedFirmFormat.name).click();

        // select start date and end date
        cy.get(audits.startDate).invoke('val', '2026-07-21').trigger('change');
        cy.get(audits.endDate).invoke('val', '2026-07-26').trigger('change');
        //set scope:
        cy.get(audits.scopeBox).type(audits.mockText)
        //set objective:
        cy.get(audits.objectiveBox).type(audits.mockText)
        //click submit
        cy.contains(submitRequest[0], submitRequest[1]).click();
        cy.contains(audits.submissionConfirmation).should('be.visible')
    })


    it("TC-AUD-05: [FUNCTIONAL] [SECURITY - XXS VULNERABILITY][NEGATIVE]make new audit request", () => {
        cy.on('uncaught:exception', (err) => {
            if (err.message.includes('showPicker')) {
                return false; // Prevent Cypress from failing the test
            }
        });
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

        // Defined Selectors
        const newAuditBtn = audits.newAudit;
        const newAuditModal = audits.add_a_new_audit_box;
        const selectFramework = audits.select_Frame_Work;
        const auditTypeToggle = audits.auditTypeToggle;
        const auditClasses = audits.auditClasses;
        const auditFirmToggle = audits.auditFirmToggle;
        const chosenFirm = audits.chosen_Audit_Firm;
        const auditFirmForms = audits.auditFirmForms;
        const submitRequest = audits.submitRequest;

        // Nested/Complex Property Extraction
        const standardTag = selectFramework[2].standardTag;
        const frameworkList = selectFramework[3];
        const auditTypes = audits.auditType;

        // 2. click on the add New Audit
        cy.contains(newAuditBtn[0], newAuditBtn[1]).click();
        // 3. Assert new box actually opened;
        cy.contains(newAuditModal[1]).should('be.visible', { timeout: 60000 });
        cy.contains(selectFramework[0], selectFramework[1]).click({ timeout: 60000 });


        // Random Selection Indicies
        const random_framework_index = 10;
        const random_firm_index = Math.floor(Math.random() * chosenFirm.length);
        const random_auditType_index = Math.floor(Math.random() * auditTypes.length);
        const random_auditClass_index = Math.floor(Math.random() * auditClasses.length);
        const random_auditFirmFormat_index = Math.floor(Math.random() * auditFirmForms.length);

        // Select Framework
        cy.contains(standardTag, frameworkList[random_framework_index]).click();

        // Select Audit Type
        cy.contains(auditTypeToggle[0], auditTypeToggle[1]).click();
        cy.contains(standardTag, auditTypes[random_auditType_index]).click();

        // Select Audit Class
        const selectedAuditClass = auditClasses[random_auditClass_index];
        cy.contains(selectedAuditClass.selector, selectedAuditClass.name).click();

        // Select Audit Firm
        cy.contains(auditFirmToggle[0], auditFirmToggle[1]).click({ timeout: 60000 });
        cy.contains(standardTag, chosenFirm[random_firm_index]).click()

        // Select Audit Firm Format
        const selectedFirmFormat = auditFirmForms[random_auditFirmFormat_index];
        cy.contains(selectedFirmFormat.selector, selectedFirmFormat.name).click();
        // select start date and end date
        cy.get(audits.startDate).invoke('val', '2026-07-21').trigger('change');
        cy.get(audits.endDate).invoke('val', '2026-07-21').trigger('change');
        //set scope with XXS
        cy.get(audits.scopeBox).type(audits.maliciousInputsXXS, { parseSpecialCharSequences: false })
        //set objective with XXS
        cy.get(audits.objectiveBox).type(audits.maliciousInputsXXS, { parseSpecialCharSequences: false })
        // 1. Intercept the call before click
        cy.intercept('POST', '**/audit*').as('xxsAuditRequest');
        //click submit
        cy.contains(submitRequest[0], submitRequest[1]).click();

        // 2. Wait for response and verify 400 Status
        cy.wait('@xxsAuditRequest').then((interception) => {
            expect(interception.response.statusCode).to.eq(400);
        });

        // 3. UI Assertion
        cy.contains(audits.xxsErrMessage).should('be.visible')
    })



    it("TC-AUD-06: [FUNCTIONAL][DATE FORMAT VERIFICATION /PAST DATE/][NEGATIVE] make new audit request", () => {
        cy.on('uncaught:exception', (err) => {
            if (err.message.includes('showPicker')) {
                return false; // Prevent Cypress from failing the test
            }
        });
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

        // Defined Selectors
        const newAuditBtn = audits.newAudit;
        const newAuditModal = audits.add_a_new_audit_box;
        const selectFramework = audits.select_Frame_Work;
        const auditTypeToggle = audits.auditTypeToggle;
        const auditClasses = audits.auditClasses;
        const auditFirmToggle = audits.auditFirmToggle;
        const chosenFirm = audits.chosen_Audit_Firm;
        const auditFirmForms = audits.auditFirmForms;
        const submitRequest = audits.submitRequest;

        // Nested/Complex Property Extraction
        const standardTag = selectFramework[2].standardTag;
        const frameworkList = selectFramework[3];
        const auditTypes = audits.auditType;

        // 2. click on the add New Audit
        cy.contains(newAuditBtn[0], newAuditBtn[1]).click();
        // 3. Assert new box actually opened;
        cy.contains(newAuditModal[1]).should('be.visible', { timeout: 60000 });
        cy.contains(selectFramework[0], selectFramework[1]).click({ timeout: 60000 });


        // Random Selection Indicies
        const random_framework_index = Math.floor(Math.random() * frameworkList.length);
        const random_firm_index = Math.floor(Math.random() * chosenFirm.length);
        const random_auditType_index = Math.floor(Math.random() * auditTypes.length);
        const random_auditClass_index = Math.floor(Math.random() * auditClasses.length);
        const random_auditFirmFormat_index = Math.floor(Math.random() * auditFirmForms.length);

        // Select Framework
        cy.contains(standardTag, frameworkList[random_framework_index]).click();

        // Select Audit Type
        cy.contains(auditTypeToggle[0], auditTypeToggle[1]).click();
        cy.contains(standardTag, auditTypes[random_auditType_index]).click();

        // Select Audit Class
        const selectedAuditClass = auditClasses[random_auditClass_index];
        cy.contains(selectedAuditClass.selector, selectedAuditClass.name).click();

        // Select Audit Firm
        cy.contains(auditFirmToggle[0], auditFirmToggle[1]).click({ timeout: 60000 });
        cy.contains(standardTag, chosenFirm[random_firm_index]).click()

        // Select Audit Firm Format
        const selectedFirmFormat = auditFirmForms[random_auditFirmFormat_index];
        cy.contains(selectedFirmFormat.selector, selectedFirmFormat.name).click();
        // select start date and end date
        cy.get(audits.startDate).invoke('val', '2022-07-21').trigger('change');
        cy.get(audits.endDate).invoke('val', '2019-07-21').trigger('change');
        //set scope:
        cy.get(audits.scopeBox).type(audits.mockText)
        //set objective:
        cy.get(audits.objectiveBox).type(audits.mockText)
        //click submit
        cy.contains(submitRequest[0], submitRequest[1]).click();
        // 3. UI Assertion
        cy.contains(audits.dateErrorMessage).should('be.visible', { defaultCommandTimeout: 10000 })
    })

    // TC-AUD-01: Task Management
    it("TC-AUD-07: [NON-FUNCTIONAL][PERFORMANCE]Task Management Page Loads Concurrently", () => {
        // Login flow
        cy.intercept('POST', '**/auth/**').as('loginRequest')
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click({ timeout: 60000 });
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);
        //click on task management
        cy.contains(appDashboard.sidebar.taskBtn[0], appDashboard.sidebar.taskBtn[1]).click({ timeout: 60000 });

        // Defined Selectors
        const header = taskManagement[0];
        const overview = taskManagement[1];
        const taskList = taskManagement[2];
        const distributionChart = taskManagement[3];
        const dailyActivity = taskManagement[4];
        const recentTasks = taskManagement[5];

        // 3. Verify the task management page is loaded
        cy.contains(header.header_Text).should('be.visible', { timeout: 60000 });
        cy.contains(overview.overview).should('be.visible')
        cy.contains(taskList.task_List).should('be.visible')
        cy.contains(distributionChart.task_Distribution_Chart).should('be.visible')
        cy.contains(dailyActivity.daily_Task_Activity).should('be.visible')
        cy.contains(recentTasks.recent_Task_Pane).should('be.visible')
    });


    //TC-AUD-08: Add Task
    it("TC-AUD-08: [FUNCTIONAL][TASK MANAGEMENT] Add Task flow is working", () => {
        // Login flow
        cy.intercept('POST', '**/auth/**').as('loginRequest')
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click({ timeout: 60000 });
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);
        //click on task management
        cy.contains(appDashboard.sidebar.taskBtn[0], appDashboard.sidebar.taskBtn[1]).click({ timeout: 60000 });

        // Defined Selectors
        const header = taskManagement[0];
        const overview = taskManagement[1];
        const taskList = taskManagement[2];
        const distributionChart = taskManagement[3];
        const dailyActivity = taskManagement[4];
        const recentTasks = taskManagement[5];
        const addTaskBtn = taskManagement[7];

        // 3. Verify the task management page is loaded
        cy.contains(header.header_Text).should('be.visible', { timeout: 60000 });
        cy.contains(overview.overview).should('be.visible')
        cy.contains(taskList.task_List).should('be.visible')
        cy.contains(distributionChart.task_Distribution_Chart).should('be.visible')
        cy.contains(dailyActivity.daily_Task_Activity).should('be.visible')
        cy.contains(recentTasks.recent_Task_Pane).should('be.visible')
        //click on add task
        cy.get(addTaskBtn.selector).click();
        //select task standard
        const standards_for_task = ["PCI-DSS", "ISO 37500", "ISO 22301", "ISO 20000"]
        const standard_selector = "Select a standard"
        const random_standard = Math.floor(Math.random() * standards_for_task.length);
        const standard_option = standards_for_task[random_standard]
        cy.contains(standard_selector).click();
        cy.contains(standard_option).click();
        //submit task
        cy.contains(addTaskBtn.submitTask).click();
    });

    it("TC-AUD-08: [FUNCTIONAL][TASK MANAGEMENT] Add Task flow is completed", () => {
        // Login flow
        cy.intercept('POST', '**/auth/**').as('loginRequest')
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click({ timeout: 60000 });
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);
        //click on task management
        cy.contains(appDashboard.sidebar.taskBtn[0], appDashboard.sidebar.taskBtn[1]).click({ timeout: 60000 });

        // Defined Selectors
        const header = taskManagement[0];
        const overview = taskManagement[1];
        const taskList = taskManagement[2];
        const distributionChart = taskManagement[3];
        const dailyActivity = taskManagement[4];
        const recentTasks = taskManagement[5];
        const addTaskBtn = taskManagement[7];

        // 3. Verify the task management page is loaded
        cy.contains(header.header_Text).should('be.visible', { timeout: 60000 });
        cy.contains(overview.overview).should('be.visible')
        cy.contains(taskList.task_List).should('be.visible')
        cy.contains(distributionChart.task_Distribution_Chart).should('be.visible')
        cy.contains(dailyActivity.daily_Task_Activity).should('be.visible')
        cy.contains(recentTasks.recent_Task_Pane).should('be.visible')
        //click on add task
        cy.get(addTaskBtn.selector).click();
        //select task standard
        const standards_for_task = ["ISO 9001", "Open Banking", "NPDA-GAID", "Agile Methodology"]
        const standard_selector = "Select a standard"
        const successMessage = "The standard implementation has been successfully started"
        const random_standard = Math.floor(Math.random() * standards_for_task.length);
        const standard_option = standards_for_task[random_standard]
        cy.contains(standard_selector).click();
        cy.contains(standard_option).click({ force: true });
        //submit task
        cy.contains(addTaskBtn.submitTask).click({ timeout: 2000 });
        // assert successful submission confirmation
        cy.contains(successMessage).should('be.visible')
    });


    // TC-AUD-02: Fiter tasks by status
    it("TC-AUD-06: Filter tasks by status", () => {
        // [SETUP] Listen for the specific API calls 
        cy.intercept('GET', '**/api/v1/tasks/implementations*').as('getTasks')
        // [SETUP] Listen for Login POST (Authentication is a POST request)
        cy.intercept('POST', '**/auth/**').as('loginRequest')

        // Login flow
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click({ timeout: 60000 });

        // [STEP 1] Validate Login Success
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);

        //click on task management
        cy.contains(appDashboard.sidebar.taskBtn[0], appDashboard.sidebar.taskBtn[1]).click({ timeout: 60000 });

        // Defined Selectors
        const header = taskManagement[0];
        const overview = taskManagement[1];
        const taskList = taskManagement[2];
        const distributionChart = taskManagement[3];
        const dailyActivity = taskManagement[4];
        const recentTasks = taskManagement[5];
        const statusFilter = taskManagement[8];

        // [STEP 2] Validate Page Load Success
        cy.wait('@getTasks').its('response.statusCode').should('eq', 200);
        // 3. Verify the task management page is loaded
        cy.contains(header.header_Text).should('be.visible', { timeout: 60000 });
        cy.contains(overview.overview).should('be.visible')
        cy.contains(taskList.task_List).should('be.visible')
        cy.contains(distributionChart.task_Distribution_Chart).should('be.visible')
        cy.contains(dailyActivity.daily_Task_Activity).should('be.visible')
        cy.contains(recentTasks.recent_Task_Pane).should('be.visible')
        //verify all standards by filtered status
        const status_category = statusFilter.categories
        const filter_random = Math.floor(Math.random() * status_category.length)
        const filter_option = status_category[filter_random]
        cy.get(statusFilter.selector).click()
        cy.contains(filter_option).click({ force: true })
        //wait for the API call to complete
        cy.wait('@getTasks').its('response.statusCode').should('eq', 200);
        cy.get(statusFilter.selector).should('contain', filter_option)
    });

    // TC-AUD-03: filter tasks by Risk Level
    it("TC-AUD-07: Filter tasks by Risk Level", () => {
        // [SETUP] Listen for the specific API calls 
        cy.intercept('GET', '**/api/v1/tasks/implementations*').as('getTasks')
        // [SETUP] Listen for Login POST (Authentication is a POST request)
        cy.intercept('POST', '**/auth/**').as('loginRequest')

        // Login flow
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click({ timeout: 60000 });

        // [STEP 1] Validate Login Success
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);

        //click on task management
        cy.contains(appDashboard.sidebar.taskBtn[0], appDashboard.sidebar.taskBtn[1]).click({ timeout: 60000 });

        // Defined Selectors
        const header = taskManagement[0];
        const overview = taskManagement[1];
        const taskList = taskManagement[2];
        const distributionChart = taskManagement[3];
        const dailyActivity = taskManagement[4];
        const recentTasks = taskManagement[5];
        const riskFilter = taskManagement[9];

        // [STEP 2] Validate Page Load Success
        cy.wait('@getTasks').its('response.statusCode').should('eq', 200);
        // 3. Verify the task management page is loaded
        cy.contains(header.header_Text).should('be.visible', { timeout: 60000 });
        cy.contains(overview.overview).should('be.visible')
        cy.contains(taskList.task_List).should('be.visible')
        cy.contains(distributionChart.task_Distribution_Chart).should('be.visible')
        cy.contains(dailyActivity.daily_Task_Activity).should('be.visible')
        cy.contains(recentTasks.recent_Task_Pane).should('be.visible')
        //verify all standards by filtered status
        const status_category = riskFilter.categories
        const filter_random = Math.floor(Math.random() * status_category.length)
        const filter_option = status_category[filter_random]
        cy.get(riskFilter.selector).click()
        cy.contains(filter_option).click({ force: true })
        //wait for the API call to complete
        cy.wait('@getTasks').its('response.statusCode').should('eq', 200);
        cy.get(riskFilter.selector).should('contain', filter_option)
    });

    // TC-AUD-04: filter tasks by Category
    it("TC-AUD-08: Filter tasks by Category", () => {
        // [SETUP] Listen for the specific API calls 
        cy.intercept('GET', '**/api/v1/tasks/implementations*').as('getTasks')
        // [SETUP] Listen for Login POST (Authentication is a POST request)
        cy.intercept('POST', '**/auth/**').as('loginRequest')

        // Login flow
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click({ timeout: 60000 });

        // [STEP 1] Validate Login Success
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);

        //click on task management
        cy.contains(appDashboard.sidebar.taskBtn[0], appDashboard.sidebar.taskBtn[1]).click({ timeout: 60000 });

        // Defined Selectors
        const header = taskManagement[0];
        const overview = taskManagement[1];
        const taskList = taskManagement[2];
        const distributionChart = taskManagement[3];
        const dailyActivity = taskManagement[4];
        const recentTasks = taskManagement[5];
        const categoryFilter = taskManagement[10];

        // [STEP 2] Validate Page Load Success
        cy.wait('@getTasks').its('response.statusCode').should('eq', 200);
        // 3. Verify the task management page is loaded
        cy.contains(header.header_Text).should('be.visible', { timeout: 60000 });
        cy.contains(overview.overview).should('be.visible')
        cy.contains(taskList.task_List).should('be.visible')
        cy.contains(distributionChart.task_Distribution_Chart).should('be.visible')
        cy.contains(dailyActivity.daily_Task_Activity).should('be.visible')
        cy.contains(recentTasks.recent_Task_Pane).should('be.visible')
        //verify all standards by filtered status
        const status_category = categoryFilter.categories
        const filter_random = Math.floor(Math.random() * status_category.length)
        const filter_option = status_category[filter_random]
        cy.get(categoryFilter.selector).click()
        cy.contains(filter_option).click({ force: true })
        //wait for the API call to complete
        cy.wait('@getTasks').its('response.statusCode').should('eq', 200);
        cy.get(categoryFilter.selector).should('contain', filter_option)
    })

    it('TC-AUD-09: Assign Task to USERS-CLIENT-INTERNAL AUDITOR [FUNCTIONAL]', () => {
        // [SETUP] Listen for the specific API calls 
        cy.intercept('GET', '**/api/v1/tasks/implementations*').as('getTasks')
        // [SETUP] Listen for Login POST (Authentication is a POST request)
        cy.intercept('POST', '**/auth/**').as('loginRequest')
        // [SETUP] Listen to Assignment call
        cy.intercept('PATCH', '**/api/v1/tasks/implementations/**').as('assignTask')
        // Login flow
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click({ timeout: 60000 });

        // [STEP 1] Validate Login Success
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);

        //click on task management
        cy.contains(appDashboard.sidebar.taskBtn[0], appDashboard.sidebar.taskBtn[1]).click({ timeout: 60000 });

        // Defined Selectors
        const header = taskManagement[0];
        const overview = taskManagement[1];
        const taskList = taskManagement[2];
        const distributionChart = taskManagement[3];
        const dailyActivity = taskManagement[4];
        const recentTasks = taskManagement[5];
        const assignTaskAction = taskManagement[14].actions[1];

        // [STEP 2] Validate Page Load Success
        cy.wait('@getTasks').its('response.statusCode').should('eq', 200);
        // 3. Verify the task management page is loaded
        cy.contains(header.header_Text).should('be.visible', { timeout: 60000 });
        cy.contains(overview.overview).should('be.visible')
        cy.contains(taskList.task_List).should('be.visible')
        cy.contains(distributionChart.task_Distribution_Chart).should('be.visible')
        cy.contains(dailyActivity.daily_Task_Activity).should('be.visible')
        cy.contains(recentTasks.recent_Task_Pane).should('be.visible')

        //verify successful assignment 1.1 get the field
        const assignment_field = assignTaskAction.selector
        // Get the operators  selector field
        const operators_field = assignTaskAction.selector_ii
        // Get available operator = Client InterAuditor
        const interAuditor = "Client InterAuditor"
        //Get the submission button to subit assignment
        const submit_btn = assignTaskAction.selector_v
        //Get the success message
        const success_msg = "Assignment updated successfully"
        cy.get(assignment_field).click()
        cy.get(operators_field).click()
        cy.contains(interAuditor).click()
        cy.get(submit_btn).click()
        //wait for the API call to complete
        cy.wait('@assignTask').its('response.statusCode').should('be.oneOf', [200, 204]);
        cy.contains(success_msg).should('be.visible')
    })

    // TC-AUD-10: Assign Task to USERS-OTHER USERS [FUNCTIONAL]
    it('TC-AUD-10: Assign Task to USERS-OTHER USERS [FUNCTIONAL]', () => {
        // [SETUP] Listen for the specific API calls 
        cy.intercept('GET', '**/api/v1/tasks/implementations*').as('getTasks')
        // [SETUP] Listen for Login POST (Authentication is a POST request)
        cy.intercept('POST', '**/auth/**').as('loginRequest')
        // [SETUP] Listen to Assignment call
        cy.intercept('POST', '**/api/v1/tasks/implementations/**').as('assignTask')
        // Login flow
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click({ timeout: 60000 });

        // [STEP 1] Validate Login Success
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);

        //click on task management
        cy.contains(appDashboard.sidebar.taskBtn[0], appDashboard.sidebar.taskBtn[1]).click({ timeout: 60000 });

        // Defined Selectors
        const header = taskManagement[0];
        const overview = taskManagement[1];
        const taskList = taskManagement[2];
        const distributionChart = taskManagement[3];
        const dailyActivity = taskManagement[4];
        const recentTasks = taskManagement[5];
        const assignTaskAction = taskManagement[14].actions[1];
        const user_ID = assignTaskAction.user_ID

        // [STEP 2] Validate Page Load Success
        cy.wait('@getTasks').its('response.statusCode').should('eq', 200);
        // 3. Verify the task management page is loaded
        cy.contains(header.header_Text).should('be.visible', { timeout: 60000 });
        cy.contains(overview.overview).should('be.visible')
        cy.contains(taskList.task_List).should('be.visible')
        cy.contains(distributionChart.task_Distribution_Chart).should('be.visible')
        cy.contains(dailyActivity.daily_Task_Activity).should('be.visible')
        cy.contains(recentTasks.recent_Task_Pane).should('be.visible')

        //verify successful assignment 1.1 get the field
        const assignment_field = assignTaskAction.selector
        // Get Other Users  selector field
        const other_users_box = assignTaskAction.selector_iii
        //Get the submission button to subit assignment
        const submit_btn = assignTaskAction.selector_v
        //Get the success message
        const success_msg = "Assignment updated successfully"
        cy.get(assignment_field).click()
        cy.get(other_users_box).click()
        cy.get(user_ID).click()
        cy.get(submit_btn).click()
        //wait for the API call to complete
        cy.wait('@assignTask').its('response.statusCode').should('be.oneOf', [200, 204]);
        cy.contains(success_msg).should('be.visible')
    })

    // TC-AUD-11: View Task Details [FUNCTIONAL]
    it('TC-AUD-11: View Task Details [FUNCTIONAL]', () => {
        //[SETUP] Listen for the specific API calls on task implementation table
        cy.intercept('GET', '**/api/v1/tasks/implementations*').as('getTasks')
        // [SETUP] Listen for the specific API calls on task details
        cy.intercept('GET', '**/team-members**').as('getTask_Details')
        // [SETUP] Listen for Login POST (Authentication is a POST request)
        cy.intercept('POST', '**/auth/**').as('loginRequest')
        // Login flow
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click({ timeout: 60000 });

        // [STEP 1] Validate Login Success
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);

        //click on task management
        cy.contains(appDashboard.sidebar.taskBtn[0], appDashboard.sidebar.taskBtn[1]).click({ timeout: 60000 });

        // Defined Selectors
        const header = taskManagement[0];
        const overview = taskManagement[1];
        const taskList = taskManagement[2];
        const distributionChart = taskManagement[3];
        const dailyActivity = taskManagement[4];
        const recentTasks = taskManagement[5];
        const view_Task_Details = taskManagement[14].actions[2];
        const page_assertion_detail = taskManagement[14].actions[0].compliance_Checklist

        // [STEP 2] Validate Page Load Success
        cy.wait('@getTasks').its('response.statusCode').should('eq', 200);
        // 3. Verify the task management page is loaded
        cy.contains(header.header_Text).should('be.visible', { timeout: 60000 });
        cy.contains(overview.overview).should('be.visible')
        cy.contains(taskList.task_List).should('be.visible')
        cy.contains(distributionChart.task_Distribution_Chart).should('be.visible')
        cy.contains(dailyActivity.daily_Task_Activity).should('be.visible')
        cy.contains(recentTasks.recent_Task_Pane).should('be.visible')

        // Vaalidate task details are returned from the API call
        cy.get(view_Task_Details.view_Details).click()
        cy.wait('@getTask_Details').its('response.statusCode').should('eq', 200);
        cy.contains(page_assertion_detail).should('be.visible', { timeout: 60000 })
    })


    // TC-AUD-11: Complete Task [FUNCTIONAL]
    it('TC-AUD-12: Complete Task [FUNCTIONAL]', () => {
        //[SETUP] Listen for the specific API calls on task implementation table
        cy.intercept('GET', '**/task-management*').as('getTasks')
        // [SETUP] Listen for the specific API calls on task details
        cy.intercept('GET', '**/team-members**').as('getTask_Details')
        // [SETUP] Listen for Login POST (Authentication is a POST request)
        cy.intercept('POST', '**/auth/**').as('loginRequest')
        // [SETUP] Listen to task submission checklist
        cy.intercept('POST', '**/api/v1/tasks/implementations/**').as('submitTask');
        // Login flow
        cy.get(signIn.emailField).type(userRoles.client.email);
        cy.get(signIn.passwordField).type(userRoles.client.password);
        cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click({ timeout: 60000 });

        // [STEP 1] Validate Login Success
        cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);

        //click on task management
        cy.contains(appDashboard.sidebar.taskBtn[0], appDashboard.sidebar.taskBtn[1]).click({ timeout: 60000 });

        // Defined Selectors
        const header = taskManagement[0];
        const overview = taskManagement[1];
        const taskList = taskManagement[2];
        const distributionChart = taskManagement[3];
        const dailyActivity = taskManagement[4];
        const recentTasks = taskManagement[5];
        const view_Task_Details = taskManagement[14].actions[2];
        const page_assertion_detail = taskManagement[14].actions[0].compliance_Checklist
        //checklist sections
        const checklistSections = taskManagement[14].actions[3];

        //checklist section 1
        const checklistSection1 = checklistSections.section_1;
        const checklist_sub = checklistSection1.sub_checkbox;
        const assign_task_1 = checklistSection1.assign_to.assign;
        const operator_type_dropdown = checklistSection1.assign_to.operations_check.box;
        const select_client_auditor = operator_type_dropdown.client_auditor_box;
        const other_users = checklistSection1.assign_to.other_users_check;
        const other_users_dropdown = other_users.box;
        const select_other_users = other_users.selected_user;
        const finish = checklistSection1.confirm_assignment;

        //checklist section 2
        const checklistSection2 = checklistSections.section_2;
        const main_toggle_1 = checklistSection2.main_toggle;
        const checklist_sub_2 = checklistSection2.sub_checkbox;
        const assign_task_2 = checklistSection2.assign_to.assign;
        const operator_type_dropdown_2 = checklistSection2.assign_to.operations_check.box;
        const select_client_auditor_2 = operator_type_dropdown_2.client_auditor_box;
        const other_users_2 = checklistSection2.assign_to.other_users_check;
        const other_users_dropdown_2 = other_users_2.box;
        const select_other_users_2 = other_users_2.selected_user;
        const finish_2 = checklistSection2.confirm_assignment;

        //checklist section 3
        const checklistSection3 = checklistSections.section_3;
        const main_toggle_2 = checklistSection3.main_toggle;
        const checklist_sub_3 = checklistSection3.sub_checkbox;
        const assign_task_3 = checklistSection3.assign_to.assign;
        const operator_type_dropdown_3 = checklistSection3.assign_to.operations_check.box;
        const select_client_auditor_3 = operator_type_dropdown_3.client_auditor_box;
        const other_users_3 = checklistSection3.assign_to.other_users_check;
        const other_users_dropdown_3 = other_users_3.box;
        const select_other_users_3 = other_users_3.selected_user;
        const finish_3 = checklistSection3.confirm_assignment;

        //checklist section 4
        const checklistSection4 = checklistSections.section_4;
        const main_toggle_3 = checklistSection4.main_toggle;
        const checklist_sub_4 = checklistSection4.sub_checkbox;
        const assign_task_4 = checklistSection4.assign_to.assign;
        const operator_type_dropdown_4 = checklistSection4.assign_to.operations_check.box;
        const select_client_auditor_4 = operator_type_dropdown_4.client_auditor_box;
        const other_users_4 = checklistSection4.assign_to.other_users_check;
        const other_users_dropdown_4 = other_users_4.box;
        const select_other_users_4 = other_users_4.selected_user;
        const finish_4 = checklistSection4.confirm_assignment;

        //checklist section 5
        const checklistSection5 = checklistSections.section_5;
        const main_toggle_4 = checklistSection5.main_toggle;
        const checklist_sub_5 = checklistSection5.sub_checkbox;
        const assign_task_5 = checklistSection5.assign_to.assign;
        const operator_type_dropdown_5 = checklistSection5.assign_to.operations_check.box;
        const select_client_auditor_5 = operator_type_dropdown_5.client_auditor_box;
        const other_users_5 = checklistSection5.assign_to.other_users_check;
        const other_users_dropdown_5 = other_users_5.box;
        const select_other_users_5 = other_users_5.selected_user;
        const finish_5 = checklistSection5.confirm_assignment;

        // 3. Verify the task management page is loaded
        // Validate Page routes to the correct endpoint
        cy.wait('@getTasks').its('response.statusCode').should('eq', 200);
        cy.contains(header.header_Text).should('be.visible', { timeout: 60000 });
        cy.contains(overview.overview).should('be.visible')
        cy.contains(taskList.task_List).should('be.visible')
        cy.contains(distributionChart.task_Distribution_Chart).should('be.visible')
        cy.contains(dailyActivity.daily_Task_Activity).should('be.visible')
        cy.contains(recentTasks.recent_Task_Pane).should('be.visible')

        // Vaalidate task details are returned from the API call
        cy.get(view_Task_Details.view_Details).click({ timeout: 60000 })
        cy.contains(page_assertion_detail).should('be.visible', { timeout: 60000 })
        cy.wait('@getTask_Details').its('response.statusCode').should('eq', 200);

        // perform the compliance checklist SECTION 1
        // perform the compliance checklist by clicking on the checkbox
        cy.get(assign_task_1).should('be.visible').click()
        // select the client auditor
        cy.get(operator_type_dropdown).click()
        cy.get(select_client_auditor).click()
        // select the other users
        cy.get(other_users_dropdown).click()
        cy.get(select_other_users).click()
        // click on complete assignment
        cy.get(finish).click()
        // Validate Task Submission Success
        cy.wait('@submitTask').its('response.statusCode').should('be.oneOf', [200, 201]);


        // perform the compliance checklist SECTION 2
        // perform the compliance checklist by clicking on the checkbox
        cy.get(main_toggle_1).click()
        cy.get(assign_task_2).should('be.visible').click()
        // select the client auditor
        cy.get(operator_type_dropdown_2).click()
        cy.get(select_client_auditor_2).click()
        // select the other users
        cy.get(other_users_dropdown_2).click()
        cy.get(select_other_users_2).click()
        // click on complete assignment
        cy.get(finish_2).click()
        // Validate Task Submission Success
        cy.wait('@submitTask').its('response.statusCode').should('be.oneOf', [200, 201]);

        // perform the compliance checklist SECTION 3
        // perform the compliance checklist by clicking on the checkbox
        cy.get(main_toggle_2).click()
        cy.get(assign_task_3).should('be.visible').click()
        // select the client auditor
        cy.get(operator_type_dropdown_3).click()
        cy.get(select_client_auditor_3).click()
        // select the other users
        cy.get(other_users_dropdown_3).click()
        cy.get(select_other_users_3).click()
        // click on complete assignment
        cy.get(finish_3).click()
        // Validate Task Submission Success
        cy.wait('@submitTask').its('response.statusCode').should('be.oneOf', [200, 201]);

        // perform the compliance checklist SECTION 4
        // perform the compliance checklist by clicking on the checkbox
        cy.get(main_toggle_3).click()
        cy.get(checklist_sub_4).should('be.visible').click()
        // select the client auditor
        cy.get(operator_type_dropdown_4).click()
        cy.get(select_client_auditor_4).click()
        // select the other users
        cy.get(other_users_dropdown_4).click()
        cy.get(select_other_users_4).click()
        // click on complete assignment
        cy.get(finish_4).click()
        // Validate Task Submission Success
        cy.wait('@submitTask').its('response.statusCode').should('be.oneOf', [200, 201]);

        // perform the compliance checklist SECTION 5
        // perform the compliance checklist by clicking on the checkbox
        cy.get(main_toggle_4).click()
        cy.get(checklist_sub_5).should('be.visible').click()
        // select the client auditor
        cy.get(operator_type_dropdown_5).click()
        cy.get(select_client_auditor_5).click()
        // select the other users
        cy.get(other_users_dropdown_5).click()
        cy.get(select_other_users_5).click()
        // click on complete assignment
        cy.get(finish_5).click()
        // Validate Task Submission Success
        cy.wait('@submitTask').its('response.statusCode').should('be.oneOf', [200, 201]);
    })

});
