describe("Auth Demo - Comprehensive Test Suite", () => {
    let testUsers, testData;

    before(() => {
        // Load test data from environment config
        const envConfig = Cypress.env('envConfig');
        testUsers = envConfig.testUsers;
        testData = envConfig.testData;
    });


    let authComponents, signIn
    let forgotPassword
    let signUp
    let bookDemo
    let standards
    before(() => {
        cy.fixture('selector-map.json').as('selectorMap') // load data from users.json
        cy.get('@selectorMap').then((selectorMap) => {
            authComponents = selectorMap.auth
            signIn = selectorMap.auth.signIn
            forgotPassword = selectorMap.auth.forgotPassword
            signUp = selectorMap.auth.signUp
            bookDemo = selectorMap.auth.bookDemo
            standards = selectorMap.standards
        })
    });

    // ==================== SUITE 1: SIGN IN FLOW ====================
    describe('Suite 1: Sign In Flow', () => {
        beforeEach(() => {
            // Navigate to login page
            cy.visit('/login');
        });


        /*
                it('Harvest selectors - Sign In page', () => {
                    cy.wait(1000);
                    cy.harvestDOM({ folder: 'auth', fileName: 'signin_harvest.json' });
                });
        */
        it('TC-SI-LI-01: Verify Sign In page loads with all elements', () => {
            // Verify email field
            cy.getSelector('auth.signIn.emailField').should('be.visible');

            // Verify password field
            cy.getSelector('auth.signIn.passwordField').should('be.visible');

            // Verify submit button
            cy.contains(signIn.submitButton[0], signIn.submitButton[1]).should('be.visible');

            // Verify "Forgot Password" link
            cy.contains(authComponents.signIn.forgotPasswordLink[0], authComponents.signIn.forgotPasswordLink[1]).should('be.visible');
            cy.contains(signUp.link[0], signUp.link[1]).should('be.visible');
        });

        let userRoles, invalidSecrets
        before(() => {
            // Load test data from environment config
            const envConfig = Cypress.env('envConfig');
            userRoles = envConfig.roles;
            invalidSecrets = envConfig.invalid
        })

        it('TC-SI-LI-02: Successful login with valid credentials', () => {
            // Enter valid credentials
            cy.get(signIn.emailField).type(userRoles.client.email);
            cy.get(signIn.passwordField).type(userRoles.client.password);
            //click submit to login
            cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click();
            cy.contains('Success').should('be.visible', { timeout: 60000 });
            //check for dashboard visibility
            cy.contains('Dashboard').should('be.visible', { timeout: 10000 });
            // Verify redirect to dashboard
            cy.url().should('include', '/dashboard');
        });

        it('TC-SI-LI-03: Invalid credentials error handling', () => {
            cy.get(signIn.emailField).type(invalidSecrets.email);
            cy.get(signIn.passwordField).type(invalidSecrets.password);
            cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click();
            cy.contains('Error').should('be.visible', { timeout: 10000 });
            cy.url().should('not.include', '/dashboard');
            cy.url().should('include', '/login');
        });


        it('TC-SI-LI-04: Email validation - empty and invalid format', () => {
            // Test empty email
            cy.contains(signIn.submitButton[0], signIn.submitButton[1]).click();
            cy.url().should('not.include', '/dashboard');
            cy.url().should('include', '/login');
            cy.contains('Validation Error').should('be.visible', { timeout: 10000 });
            // Clear and test invalid format
        });

        it('TC-SI-LI-05: Forgot Password link navigation', () => {
            // Click "Forgot Password" link
            cy.contains(signIn.forgotPasswordLink[0], signIn.forgotPasswordLink[1]).click();
            // Verify navigation to forgot password page
            cy.url().should('match', /\/(forgot|reset)/);
        });

    });

    // ==================== SUITE 2: SIGN UP FLOW ====================
    describe('Suite 2: Sign Up Flow', () => {
        beforeEach(() => {
            // Navigate to signup page
            cy.visit('/signup');
        });
        /*
        it('Harvest selectors - Sign Up page', () => {
            cy.wait(1000);
            cy.harvestDOM({ folder: 'auth', fileName: 'signup_harvest.json' });
        });
        */

        let userRoles, invalidSecrets
        before(() => {
            // Load test data from environment config
            const envConfig = Cypress.env('envConfig');
            userRoles = envConfig.roles;
            invalidSecrets = envConfig.invalid
        })
        it('TC-SU-LI-01: Verify Sign Up page loads with all fields', () => {
            //verify first and last name fields
            cy.get(signUp.firstNameField).should('be.visible');
            cy.get(signUp.lastNameField).should('be.visible');
            //verify email field
            cy.get(signUp.emailField).should('be.visible');
            //verify password field
            cy.get(signUp.passwordField).should('be.visible');
            //verify confirm password field
            cy.get(signUp.confirmPasswordField).should('be.visible');
            //verify submit button
            cy.contains(signUp.submitButton[0], signUp.submitButton[1]).should('be.visible')
        });

        it('TC-SU-LI-02: Successful registration', () => {
            // Fill registration form
            let randomNumber = Math.floor(Math.random() * 10000);
            cy.get(signUp.firstNameField).type('John');
            cy.get(signUp.lastNameField).type('Doe');
            cy.get(signUp.emailField).type('paulanderson@mycompany' + randomNumber + '.co.za');
            cy.get(signUp.passwordField).type('October@28');
            cy.get(signUp.confirmPasswordField).type('October@28');
            // Submit form
            cy.contains(signUp.submitButton[0], signUp.submitButton[1]).click();
            cy.contains("Success").should('be.visible', { timeout: 10000 });
        });

        it('TC-SU-FN-01: Password strength validation', () => {
            // Enter weak password
            cy.get(signUp.passwordField).type(testUsers.weakPassword.password);

            // Verify password strength indicator shows weak
            cy.contains('At least 8 characters long').should('be.visible');
        });


        it('TC-SU-N-01: Submit with empty fields shows validation errors', () => {
            // Submit empty form
            cy.contains(signUp.submitButton[0], signUp.submitButton[1]).click();

            // Verify that no submission takes place
            cy.url().should('include', '/signup');
        });

        it('TC-SU-N-03: Existing email error handling', () => {
            // Prevent Cypress from failing on the expected 409 error
            cy.on('uncaught:exception', (err) => {
                if (err.message.includes('409')) {
                    return false;
                }
            });

            // Try to register with existing email
            cy.get(signUp.firstNameField).type('John');
            cy.get(signUp.lastNameField).type('Doe');
            cy.get(signUp.emailField).type(userRoles.client.email);
            cy.get(signUp.passwordField).type(userRoles.client.password);
            cy.get(signUp.confirmPasswordField).type(userRoles.client.password);
            // Submit form
            cy.contains(signUp.submitButton[0], signUp.submitButton[1]).click();

            // Verify existing email error
            cy.contains('Error').should('be.visible');
        });
    });

    // ==================== SUITE 3: FORGOT PASSWORD FLOW ====================
    describe('Suite 3: Forgot Password Flow', () => {
        beforeEach(() => {
            // Navigate to forgot password page
            cy.visit('/forgot-password');
        });

        let userRoles
        let invalidSecrets
        before(() => {
            // Load test data from environment config
            const envConfig = Cypress.env('envConfig');
            userRoles = envConfig.roles;
            invalidSecrets = envConfig.invalid
        })
        /*
                it('Harvest selectors - Forgot Password page', () => {
                    cy.wait(1000);
                    cy.harvestDOM({ folder: 'auth', fileName: 'forgotpassword_harvest.json' });
                });
        */
        it('TC-FP-LI-01: Verify Forgot Password page loads', () => {
            // Verify email field
            cy.getSelector('auth.forgotPassword.emailField').should('be.visible');

            // Verify submit button
            cy.contains(forgotPassword.submitButton[1]).should('be.visible');
        });

        it('TC-FP-LI-02: Submit valid email for password reset', () => {
            // Enter valid email
            cy.getSelector('auth.forgotPassword.emailField').type(userRoles.client.email);

            // Submit form
            cy.contains(forgotPassword.submitButton[0], forgotPassword.submitButton[1]).click();

            // Verify success message
            cy.contains('Success').should('be.visible', { timeout: 10000 });
        });

        it('TC-FP-LI-03: Email format validation', () => {
            // Prevent Cypress from failing on the expected error
            cy.on('uncaught:exception', (err) => {
                if (err.message.includes('User not found')) {
                    return false;
                }
            });
            // Enter invalid email format
            cy.getSelector('auth.forgotPassword.emailField').type(invalidSecrets.email);

            // Submit form
            cy.contains(forgotPassword.submitButton[0], forgotPassword.submitButton[1]).click();

            // Verify email error
            cy.contains('Error').should('be.visible');
        });
    });

    // ==================== SUITE 4: BOOK A DEMO FLOW ====================
    describe.only('Suite 4: Book a Demo Flow', () => {
        beforeEach(() => {
            // Navigate to book a demo page
            cy.visit('/book-a-demo');
        });

        let userRoles, invalidSecrets
        before(() => {
            // Load test data from environment config
            const envConfig = Cypress.env('envConfig');
            userRoles = envConfig.roles;
            invalidSecrets = envConfig.invalid
        })
        /* it('Harvest selectors - Book a Demo page', () => {
             cy.wait(1000);
             cy.harvestDOM({ folder: 'auth', fileName: 'bookdemo_harvest.json' });
         });*/

        it('TC-DEMO-LI: Verify Book a Demo page loads', () => {
            // Verify first & last name field
            cy.get(bookDemo.firstNameField).should('be.visible');
            cy.get(bookDemo.lastNameField).should('be.visible');

            // Verify email field
            cy.get(bookDemo.emailField).should('be.visible');

            // Verify proposal field
            cy.get(bookDemo.phoneField).should('be.visible');
            cy.get(bookDemo.companyField).should('be.visible');

            // Verify the submit button
            cy.contains(bookDemo.submitButton[0], bookDemo.submitButton[1]).should('be.visible');
        });

        it('TC-DEMO-FN: Validate required fields (first name, company name, phone number, work email)', () => {
            // Submit empty form
            cy.contains(bookDemo.submitButton[0], bookDemo.submitButton[1]).click();
            // Verify field errors appear
            cy.contains(bookDemo.errorMessage).should('be.visible');
        });

        it('TC-DEMO-FN-C: Successful demo booking', () => {
            // Fill all fields
            let randomNumber = Math.floor(Math.random() * 10000)
            cy.get(bookDemo.firstNameField).type(testData.demoBooking.firstName);
            cy.get(bookDemo.lastNameField).type(testData.demoBooking.lastName);
            cy.get(bookDemo.emailField).type('paulanderson@mycompany' + randomNumber + '.co.za');
            cy.get(bookDemo.phoneField).type(testData.demoBooking.phone[0]);
            cy.get(bookDemo.companyField).type(testData.demoBooking.company);
            // Submit form
            cy.contains(bookDemo.submitButton[0], bookDemo.submitButton[1]).click();
            // complete booking for your demo, select all standards
            const chosenStandard = standards
            Object.entries(chosenStandard).forEach(([key, value]) => {
                cy.contains(value, key).click()
            });
            cy.contains(bookDemo.finishBookingButton[0], bookDemo.finishBookingButton[1]).click();
            cy.contains(bookDemo.successMessage).should('be.visible', { timeout: 60000 });

        });

        it('TC-DEMO-N: Invalid booking submissions [EMAIL - CONCTACT INFO]', () => {
            // Fill form with invalid email
            cy.get(bookDemo.firstNameField).type(bookDemo.validBiodata.firstName);
            cy.get(bookDemo.lastNameField).type(bookDemo.validBiodata.lastName);
            cy.get(bookDemo.emailField).type(bookDemo.invalidBiodata.email);
            cy.get(bookDemo.phoneField).type(bookDemo.invalidBiodata.phoneNumber);
            cy.get(bookDemo.companyField).type(bookDemo.invalidBiodata.companyName);

            // Submit form
            cy.contains(bookDemo.submitButton[0], bookDemo.submitButton[1]).click();

            // Verify error message
            cy.contains(bookDemo.errorMessage_invalidInputs[0]
                || bookDemo.errorMessage_invalidInputs[1]).should('be.visible');
        });


        it('TC-DEMO-N: [XXS] Invalid booking submissions[NAME, COMPANY DETAILS]', () => {
            // Fill form with invalid email
            cy.get(bookDemo.firstNameField).type(bookDemo.invalidBiodata.firstName);
            cy.get(bookDemo.lastNameField).type(bookDemo.invalidBiodata.lastName);
            cy.get(bookDemo.emailField).type(bookDemo.validBiodata.email);
            cy.get(bookDemo.phoneField).type(bookDemo.validBiodata.phoneNumber);
            cy.get(bookDemo.companyField).type(bookDemo.validBiodata.companyName);

            // Submit form
            cy.contains(bookDemo.submitButton[0], bookDemo.submitButton[1]).click();
            // for proactive check the standards page should not be available after malicious inputs:
            cy.contains(bookDemo.finalBookingPage).should('not.exist', { defaultCommandTimeout: 1000 });
            // Verify error message
            cy.contains(bookDemo.errorMessage_invalidInputs[2]
                || bookDemo.errorMessage_invalidInputs[3]
                || bookDemo.errorMessage_invalidInputs[4]).should('be.visible');
        });

    });
});
