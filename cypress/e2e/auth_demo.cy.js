describe("Auth Demo - Comprehensive Test Suite", () => {
    let testUsers, testData;

    before(() => {
        // Load test data from environment config
        const envConfig = Cypress.env('envConfig');
        testUsers = envConfig.testUsers;
        testData = envConfig.testData;
    });

    // ==================== SUITE 1: SIGN IN FLOW ====================
    describe('Suite 1: Sign In Flow', () => {
        beforeEach(() => {
            // Navigate to login page
            cy.visit('/login');
        });

        it('Harvest selectors - Sign In page', () => {
            cy.wait(1000);
            cy.harvestDOM({ folder: 'auth', fileName: 'signin_harvest.json' });
        });

        it('TC-SI-LI-01: Verify Sign In page loads with all elements', () => {
            // Verify email field
            cy.getSelector('auth.signIn.emailField').should('be.visible');

            // Verify password field
            cy.getSelector('auth.signIn.passwordField').should('be.visible');

            // Verify submit button
            cy.getSelector('auth.signIn.submitButton').should('be.visible');

            // Verify "Forgot Password" link
            cy.getSelector('auth.signIn.forgotPasswordLink').should('be.visible');
        });

        it('TC-SI-LI-02: Successful login with valid credentials', () => {
            // Enter valid credentials
            cy.getSelector('auth.signIn.emailField').type(testUsers.valid.email);
            cy.getSelector('auth.signIn.passwordField').type(testUsers.valid.password);

            // Submit form
            cy.getSelector('auth.signIn.submitButton').click({ timeout: 10000 });

            // Verify redirect to dashboard
            cy.url().should('include', '/dashboard');
        });

        it('TC-SI-LI-03: Invalid credentials error handling', () => {
            // Enter invalid credentials
            cy.getSelector('auth.signIn.emailField').type(testUsers.invalid.email);
            cy.getSelector('auth.signIn.passwordField').type(testUsers.invalid.password);

            // Submit form
            cy.getSelector('auth.signIn.submitButton').click();

            // Verify error message appears
            cy.getSelector('auth.signIn.errorMessage')
                .should('be.visible')
                .and('contain.text', 'Invalid');
        });

        it('TC-SI-LI-04: Email validation - empty and invalid format', () => {
            // Test empty email
            cy.getSelector('auth.signIn.passwordField').type(testUsers.valid.password);
            cy.getSelector('auth.signIn.submitButton').click();
            cy.getSelector('auth.signIn.emailError').should('be.visible');

            // Clear and test invalid format
            cy.getSelector('auth.signIn.emailField').type(testData.invalidEmails[0]);
            cy.getSelector('auth.signIn.submitButton').click();
            cy.getSelector('auth.signIn.emailError').should('be.visible');
        });

        it('TC-SI-LI-05: Password visibility toggle', () => {
            // Type password
            cy.getSelector('auth.signIn.passwordField').type(testUsers.valid.password);

            // Verify password is hidden by default
            cy.getSelector('auth.signIn.passwordField').should('have.attr', 'type', 'password');

            // Click toggle button
            cy.getSelector('auth.signIn.passwordToggle').click();

            // Verify password is now visible
            cy.getSelector('auth.signIn.passwordField').should('have.attr', 'type', 'text');
        });

        it('TC-SI-LI-06: Forgot Password link navigation', () => {
            // Click "Forgot Password" link
            cy.getSelector('auth.signIn.forgotPasswordLink').click();

            // Verify navigation to forgot password page
            cy.url().should('match', /\/(forgot|reset)/);
        });

        it('TC-SI-LI-07: Log In button is visible and enabled', () => {
            // Verify button is visible
            cy.getSelector('auth.signIn.submitButton')
                .should('be.visible')
                .and('not.be.disabled');
        });
    });

    // ==================== SUITE 2: SIGN UP FLOW ====================
    describe('Suite 2: Sign Up Flow', () => {
        beforeEach(() => {
            // Navigate to signup page
            cy.visit('/signup');
        });

        it('Harvest selectors - Sign Up page', () => {
            cy.wait(1000);
            cy.harvestDOM({ folder: 'auth', fileName: 'signup_harvest.json' });
        });

        it('TC-SU-LI-01: Verify Sign Up page loads with all fields', () => {
            // Verify email field
            cy.getSelector('auth.signUp.emailField').should('be.visible');

            // Verify password field
            cy.getSelector('auth.signUp.passwordField').should('be.visible');

            // Verify privacy checkbox
            cy.getSelector('auth.signUp.privacyCheckbox').should('be.visible');

            // Verify submit button
            cy.getSelector('auth.signUp.submitButton').should('be.visible');
        });

        it.only('TC-SU-LI-02: Successful registration', () => {
            // Fill registration form
            cy.getSelector('auth.signUp.firstNameField').type('John');
            cy.getSelector('auth.signUp.lastNameField').type('Doe');
            cy.getSelector('auth.signUp.emailField').type('paulanderson@mycompany10.co.za');
            cy.getSelector('auth.signUp.passwordField').type('October@28');
            cy.getSelector('auth.signUp.confirmPasswordField').type('October@28');

            // Check privacy checkbox if it exists (as per requirements)
            // cy.getSelector('auth.signUp.privacyCheckbox').check();

            // Submit form
            cy.contains('button', 'Create Account').click();

            // Verify redirect to dashboard or confirmation
            cy.contains('body', 'Sign In').should('be.visible');
            cy.getSelector('auth.signIn.emailField').type('paulanderson@mycompany10.co.za');
            cy.getSelector('auth.signIn.passwordField').type('October@28');
            cy.wait(1000);
            cy.getSelector('auth.signIn.submitButton').click();
            cy.contains('body', 'Email Verification').should('be.visible');
        });

        it('TC-SU-FN-01: Password strength validation', () => {
            // Enter weak password
            cy.getSelector('auth.signUp.passwordField').type(testUsers.weakPassword.password);

            // Verify password strength indicator shows weak
            cy.getSelector('auth.signUp.passwordStrengthIndicator')
                .should('be.visible')
                .and('contain.text', 'weak');
        });

        it('TC-SU-FN-02: Privacy policy acceptance required', () => {
            // Fill form without checking privacy
            cy.getSelector('auth.signUp.emailField').type(testUsers.newUser.email);
            cy.getSelector('auth.signUp.passwordField').type(testUsers.newUser.password);

            // Submit without privacy checkbox
            cy.getSelector('auth.signUp.submitButton').click();

            // Verify privacy error appears
            cy.getSelector('auth.signUp.privacyError').should('be.visible');
        });

        it('TC-SU-N-01: Submit with empty fields shows validation errors', () => {
            // Submit empty form
            cy.getSelector('auth.signUp.submitButton').click();

            // Verify error message appears
            cy.getSelector('auth.signUp.errorMessage').should('be.visible');
        });

        it('TC-SU-N-03: Existing email error handling', () => {
            // Try to register with existing email
            cy.getSelector('auth.signUp.emailField').type(testUsers.existingEmail.email);
            cy.getSelector('auth.signUp.passwordField').type(testUsers.existingEmail.password);
            cy.getSelector('auth.signUp.privacyCheckbox').check();

            // Submit form
            cy.getSelector('auth.signUp.submitButton').click();

            // Verify existing email error
            cy.getSelector('auth.signUp.existingEmailError')
                .should('be.visible')
                .and('contain.text', 'already');
        });
    });

    // ==================== SUITE 3: FORGOT PASSWORD FLOW ====================
    describe('Suite 3: Forgot Password Flow', () => {
        beforeEach(() => {
            // Navigate to forgot password page
            cy.visit('/forgot-password');
        });

        it('Harvest selectors - Forgot Password page', () => {
            cy.wait(1000);
            cy.harvestDOM({ folder: 'auth', fileName: 'forgotpassword_harvest.json' });
        });

        it('TC-FP-LI-01: Verify Forgot Password page loads', () => {
            // Verify email field
            cy.getSelector('auth.forgotPassword.emailField').should('be.visible');

            // Verify submit button
            cy.getSelector('auth.forgotPassword.submitButton').should('be.visible');

            // Verify back to login link
            cy.getSelector('auth.forgotPassword.backToLoginLink').should('be.visible');
        });

        it('TC-FP-LI-02: Submit valid email for password reset', () => {
            // Enter valid email
            cy.getSelector('auth.forgotPassword.emailField').type(testData.forgotPassword.validEmail);

            // Submit form
            cy.getSelector('auth.forgotPassword.submitButton').click();

            // Verify success message
            cy.getSelector('auth.forgotPassword.successMessage')
                .should('be.visible')
                .and('contain.text', 'sent');
        });

        it('TC-FP-LI-03: Email format validation', () => {
            // Enter invalid email format
            cy.getSelector('auth.forgotPassword.emailField').type(testData.invalidEmails[0]);

            // Submit form
            cy.getSelector('auth.forgotPassword.submitButton').click();

            // Verify email error
            cy.getSelector('auth.forgotPassword.emailError').should('be.visible');
        });

        it('TC-FP-FN-C: Submit invalid email shows generic error', () => {
            // Enter email that doesn't exist
            cy.getSelector('auth.forgotPassword.emailField').type(testData.forgotPassword.invalidEmail);

            // Submit form
            cy.getSelector('auth.forgotPassword.submitButton').click();

            // Verify generic error (for security, shouldn't reveal if email exists)
            cy.getSelector('auth.forgotPassword.errorMessage').should('be.visible');
        });

        it('TC-FP-NEG: Submit with invalid format shows validation error', () => {
            // Enter completely invalid format
            cy.getSelector('auth.forgotPassword.emailField').type(testData.invalidEmails[1]);

            // Submit form
            cy.getSelector('auth.forgotPassword.submitButton').click();

            // Verify validation error
            cy.getSelector('auth.forgotPassword.emailError')
                .should('be.visible')
                .and('contain.text', 'valid');
        });
    });

    // ==================== SUITE 4: BOOK A DEMO FLOW ====================
    describe('Suite 4: Book a Demo Flow', () => {
        beforeEach(() => {
            // Navigate to book a demo page
            cy.visit('/book-a-demo');
        });

        it('Harvest selectors - Book a Demo page', () => {
            cy.wait(1000);
            cy.harvestDOM({ folder: 'auth', fileName: 'bookdemo_harvest.json' });
        });

        it('TC-DEMO-LI: Verify Book a Demo page loads', () => {
            // Verify first name field
            cy.getSelector('auth.bookDemo.firstNameField').should('be.visible');

            // Verify email field
            cy.getSelector('auth.bookDemo.emailField').should('be.visible');

            // Verify proposal field
            cy.getSelector('auth.bookDemo.proposalField').should('be.visible');

            // Verify privacy checkbox
            cy.getSelector('auth.bookDemo.privacyCheckbox').should('be.visible');
        });

        it('TC-DEMO-FN: Validate required fields (first name, proposal, privacy)', () => {
            // Submit empty form
            cy.getSelector('auth.bookDemo.submitButton').click();

            // Verify field errors appear
            cy.getSelector('auth.bookDemo.fieldError').should('be.visible');
        });

        it('TC-DEMO-FN-C: Successful demo booking', () => {
            // Fill all fields
            cy.getSelector('auth.bookDemo.firstNameField').type(testData.demoBooking.firstName);
            cy.getSelector('auth.bookDemo.emailField').type(testData.demoBooking.email);
            cy.getSelector('auth.bookDemo.proposalField').type(testData.demoBooking.proposal);
            cy.getSelector('auth.bookDemo.privacyCheckbox').check();

            // Submit form
            cy.getSelector('auth.bookDemo.submitButton').click();

            // Verify success message
            cy.getSelector('auth.bookDemo.successMessage')
                .should('be.visible')
                .and('contain.text', 'success');
        });

        it('TC-DEMO-N: Invalid email error handling', () => {
            // Fill form with invalid email
            cy.getSelector('auth.bookDemo.firstNameField').type(testData.demoBooking.firstName);
            cy.getSelector('auth.bookDemo.emailField').type(testData.demoBooking.invalidEmail);
            cy.getSelector('auth.bookDemo.proposalField').type(testData.demoBooking.proposal);
            cy.getSelector('auth.bookDemo.privacyCheckbox').check();

            // Submit form
            cy.getSelector('auth.bookDemo.submitButton').click();

            // Verify email error
            cy.getSelector('auth.bookDemo.emailError')
                .should('be.visible')
                .and('contain.text', 'valid');
        });

        it('TC-DEMO-N: Alphabetic name validation', () => {
            // Try to enter numbers in first name
            cy.getSelector('auth.bookDemo.firstNameField').type('John123');

            // Submit form
            cy.getSelector('auth.bookDemo.submitButton').click();

            // Verify first name error
            cy.getSelector('auth.bookDemo.firstNameError').should('be.visible');
        });

        it('TC-DEMO-N: Long input truncation (256+ characters)', () => {
            // Enter extremely long input
            cy.getSelector('auth.bookDemo.proposalField').type(testData.demoBooking.longInput);

            // Verify input is truncated or shows error
            cy.getSelector('auth.bookDemo.proposalField').invoke('val').then((val) => {
                expect(val.length).to.be.at.most(256);
            });
        });

        it('TC-DEMO-N: SQL injection prevention', () => {
            // Try SQL injection in proposal field
            cy.getSelector('auth.bookDemo.firstNameField').type(testData.demoBooking.firstName);
            cy.getSelector('auth.bookDemo.emailField').type(testData.demoBooking.email);
            cy.getSelector('auth.bookDemo.proposalField').type(testData.demoBooking.sqlInjection);
            cy.getSelector('auth.bookDemo.privacyCheckbox').check();

            // Submit form
            cy.getSelector('auth.bookDemo.submitButton').click();

            // Verify form either accepts it safely or shows validation error
            // The key is that it shouldn't cause a server error
            cy.url().should('not.contain', 'error=500');
        });
    });
});
