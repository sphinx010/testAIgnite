//      NONE FUNCTIONAL TEST [USER INTERFACE]
describe("Suite 1: Landing Page - None Functional Tests", () => {
  beforeEach(() => {
    // The landing environment config sets the baseUrl to https://www.regtech365.com/
    cy.visit("/");
  });

  it("TC-LP-01: Global Navigation & Branding Integrity", () => {
    // Verify Logo redirect (implicitly checking visibility first)
    cy.getSelector('landingPage.logo.RegTech365').as('logo').should("be.visible").click();
    cy.url().should("eq", "https://www.regtech365.com/");

    // Check Nav Links
    cy.getSelector("landingPage.nav.solutions").should("be.visible");
    cy.getSelector("landingPage.nav.blog").should("be.visible");
    cy.getSelector("landingPage.nav.pricing").should("be.visible");
  });

  it("TC-LP-02: Hero Section & Primary CTAs", () => {
    // Verify Headline
    cy.getSelector("landingPage.hero.headline").should("be.visible");

    // Verify "Sign in" navigates to the login portal (partially checked by existence)
    cy.getSelector("landingPage.nav.signIn").should("be.visible");

    // Verify "Get started" CTA
    cy.getSelector("landingPage.hero.getStarted").should("be.visible");
  });

  it("TC-LP-03: Solutions Cards & Interactive Content", () => {
    // Scroll to solutions
    cy.getSelector("landingPage.solutions.auditMgt").scrollIntoView().should("be.visible");
    cy.getSelector("landingPage.solutions.docMgt").should("be.visible");
  });

  it("TC-LP-04: Credibility (Trust Metrics & Certifications)", () => {
    // Verify Trust Section
    cy.getSelector("landingPage.trust.trustedText").scrollIntoView().should("be.visible");
  });

  it("TC-LP-05: Footer Navigation & Contact Details", () => {
    // Scroll to footer
    cy.getSelector("landingPage.footer.location").scrollIntoView().should("be.visible");
    cy.getSelector("landingPage.footer.privacyLink").should("be.visible");
    cy.getSelector("landingPage.footer.aboutUs").should("be.visible");
  });

});

//      FUNCTIONAL TESTS     
describe.only('Suite 2: Landing Page Functionality Tests', () => {
  beforeEach(() => {
    cy.visit("/");
  })
  it("TC-LPF-01: [NAV] RegTech365 Solutions = RegComply & RegLearn", () => {
    // 1. click on solutions
    cy.getSelector('landingPage.navItems.solutions').should('be.visible').click();
    cy.contains('RegComply').should('be.visible').click();
    cy.url().should('include', '/login')
    cy.visit("/")
    cy.getSelector('landingPage.navItems.solutions').should('be.visible').click();
    cy.contains('RegLearn').should('be.visible').click();
    cy.url().should('include', '/login')
    cy.visit("/")
  })


  it('TC-LPF-02: [NAV]RegTech365 Solutions = RegWatch & RegPort', () => {
    cy.getSelector('landingPage.navItems.solutions').should('be.visible').click();
    //I USED the wildcard (*) if the URL has those long tracking parameters
    //the click on regwatch since its cross domain navigation
    cy.contains('RegWatch').should('be.visible').click()
    cy.origin('https://regwatch.regtech365.com/**', () => {
      //intercept didn't work so i tried url assertions... i am a little confused how cypress didn't catch any post request
      cy.url().should('contain', 'regwatch.regtech365.com');
    })
    cy.visit("/")

    cy.getSelector('landingPage.navItems.solutions').should('be.visible').click();
    //I USED the wildcard (*) if the URL has those long tracking parameters
    //the click on regwatch since its cross domain navigation
    cy.contains('RegPort').should('be.visible').click()
    cy.origin('https://regport.regtech365.com/**', () => {
      //intercept didn't work so i tried url assertions... i am a little confused how cypress didn't catch any post request
      cy.url().should('contain', 'regport.regtech365.com');
    })
  })

  it('TC-LPF-03: [NAV] RegTech365 Packages', () => {
    cy.getSelector('landingPage.navItems.packages').should('be.visible').click();
    cy.url().should('contain', '/packages')
  })

  it('TC-LPF-04:[NAV] RegTech365 Blog', () => {
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });

    cy.getSelector('landingPage.navItems.blog').click();

    // Stabilize
    cy.wait(1000);

    cy.location('href').then((hrefBefore) => {
      // The original assertion was just .click(). Now we verify effect.
      cy.contains('The Importance of Regulatory Technology (RegTech) in Ensuring Business Compliance')
        .should('be.visible')
        .click();

      // Wait for potential action to occur
      cy.wait(2000);

      cy.location('href').then((hrefAfter) => {
        const urlChanged = hrefAfter !== hrefBefore;
        if (urlChanged) {
          cy.url().should('contain', '/blog');
        } else {
          cy.get('@windowOpen').then((stub) => {
            if (stub.callCount === 0) {
              throw new Error('Blog article clicked but no navigation (URL change) or new tab (window.open) occurred.');
            }
          });
          cy.get('@windowOpen').should('be.called');
        }
      });
    });
  })

  it('TC-LPF-05:[BUTTON] RegTech365 Pricing', () => {
    let hrefBefore;

    // capture console errors
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
      cy.stub(win.console, 'error').as('consoleError');
    });

    cy.getSelector('landingPage.navItems.pricing').click();
    cy.location('pathname', { timeout: 10000 }).should('eq', '/pricing');

    cy.location('href').then((hrefBefore) => {
      cy.get('.bg-gradient-to-b > :nth-child(2) > .justify-center')
        .should('be.visible')
        .and('not.be.disabled')
        .click({ force: true });

      // Wait for potential action to occur
      cy.wait(2000);

      cy.location('href').then((hrefAfter) => {
        const urlChanged = hrefAfter !== hrefBefore;
        if (urlChanged) {
          // If URL changed, we are good
          expect(urlChanged, 'CTA triggered navigation').to.be.true;
        } else {
          // If URL did not change, check if window.open was triggered
          cy.get('@windowOpen').then((stub) => {
            if (stub.callCount === 0) {
              throw new Error('CTA clicked but no navigation (URL change) or new tab (window.open) occurred.');
            }
          });
          cy.get('@windowOpen').should('be.called');
        }
      });
    });

    cy.get('@consoleError').should('not.be.called');
  });

  it('TC-LPF-06: [LINKS] TALK TO US', () => {
    cy.getSelector('landingPage.ctaExtra.talkToUsLink').click();
    cy.url().should('contain', '/book-a-demo')
  })

  it('TC-LPF-07: [LINKS] EXPLORE OUR SOLUTIONS', () => {
    cy.getSelector('landingPage.ctaExtra.exploreSolutions').click();
    cy.url().should('contain', '/book-a-demo')
  })

  it('TC-LPF-08: [LINKS] CONSULT WITH A SPECIALIST', () => {
    cy.getSelector('landingPage.ctaExtra.consultSpecialist').click();
    cy.url().should('contain', '/book-a-demo')
  })

  it('TC-LPF-09: [BUTTON] BOOK YOUR DEMO NOW', () => {
    cy.getSelector('landingPage.ctaExtra.bookDemoButton').click();
    cy.url().should('contain', '/book-a-demo')
  })

  it('TC-LPF-10: [BUTTON] SIGN IN NAVIGATION', () => {
    // Verify top-right Sign In button directs to login
    cy.getSelector('landingPage.nav.signIn').click({ timeout: 10000 });
    cy.url().should('contain', '/login');
  })

  it('TC-LPF-11: [LINKS] FOOTER PRIVACY POLICY', () => {
    // Verify footer link works (using scrollIntoView to ensure interactability)
    cy.getSelector('landingPage.footer.privacyLink')
      .scrollIntoView()
      .should('be.visible')
      .click();
    cy.url().should('contain', '/privacy-policy');
  })

  it("TC-LPF-12: [MOBILE] Responsive Layout & Hamburger Menu", () => {
    // Mobile viewport
    cy.viewport(375, 667);
    // Verify hamburger is visible (Assuming it has a specific aria-label or tag from harvest)
    // From harvest, the hamburger might be a button with text or specific class.
    // Let's check for a button that appeared upon resize (not in our map yet).
    cy.get("button").find("svg").should("be.visible");
  });
});
