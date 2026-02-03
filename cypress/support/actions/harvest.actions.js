/**
 * DOM HARVESTING ACTIONS
 * 
 * Logic to scrape CTAs and textual elements for audits and AI consumption.
 * Enhanced with categorization, purpose-based grouping, and candidate selector generation.
 */

/**
 * Scrapes elements from the current page and returns a structured object.
 * @param {string} rootSelector - The root element to start scraping from (default: "body")
 * @returns {Cypress.Chainable<Object>}
 */
export const getHarvestData = (rootSelector = "body") => {
    return cy.get(rootSelector).then(($root) => {
        const doc = $root[0].ownerDocument;
        const candidates = [];
        const byCategory = {
            images: [],
            svgs: [],
            buttons: [],
            links: [],
            inputs: [],
            selects: [],
            textareas: [],
            menuItems: [],
            headings: [],
            toggles: [],
            other: [],
        };
        const byPurpose = {
            textAssertions: [],
            visuals: [],
            clickables: [],
            inputs: [],
            navigation: [],
        };

        const pushCandidate = (el) => {
            const $el = Cypress.$(el);
            const text = $el.text().trim();
            const testid = $el.attr("data-testid") || $el.attr("data-test") || $el.attr("data-cy");
            const aria = $el.attr("aria-label");
            const id = el.id;
            const name = $el.attr("name");
            const placeholder = $el.attr("placeholder");
            const role = $el.attr("role");
            const tag = el.tagName.toLowerCase();
            const alt = $el.attr("alt");
            const src = el.currentSrc || $el.attr("src") || $el.attr("data-src");

            const isImage = tag === "img";
            const isSvg = tag === "svg" || role === "img";

            // Skip elements that have no identifying information (allow media even if minimal)
            if (
                !isImage &&
                !isSvg &&
                !text &&
                !testid &&
                !aria &&
                !id &&
                !name &&
                !placeholder
            ) {
                return;
            }

            // Generate a list of candidate selectors for the selector-map
            const selectors = [];
            if (testid) selectors.push(`[data-cy="${testid}"]`);
            if (id) selectors.push(`#${id}`);
            if (aria) selectors.push(`[aria-label="${aria}"]`);
            if (name) selectors.push(`${tag}[name="${name}"]`);
            if (placeholder) selectors.push(`${tag}[placeholder="${placeholder}"]`);
            if (text && text.length < 50) selectors.push(`cy.contains("${tag}", ${JSON.stringify(text)})`);
            if (alt) selectors.push(`${tag}[alt=${JSON.stringify(alt)}]`);
            if (src && isImage) selectors.push(`${tag}[src=${JSON.stringify(src)}]`);
            if (isSvg && role === "img") selectors.push(`${tag}[role="img"]`);

            const candidate = {
                tag,
                role,
                text,
                id,
                name,
                placeholder,
                testid,
                aria,
                alt,
                src,
                class: $el.attr("class"),
                selectors,
            };

            candidates.push(candidate);

            // determine context and purpose
            const inSidebar = $el.closest("aside, nav").length > 0;
            const isToggle = /toggle/i.test(text || "") || /toggle/i.test(aria || "");
            const isClickable = tag === "button" || tag === "a" || role === "button" || role === "menuitem";
            const isInput = tag === "input" || tag === "select" || tag === "textarea";
            const isHeading = tag.startsWith("h");
            const isMedia = isImage || isSvg;

            // Group by Category
            if (isImage) {
                byCategory.images.push(candidate);
            } else if (isSvg) {
                byCategory.svgs.push(candidate);
            } else if (tag === "button" || role === "button") {
                byCategory.buttons.push(candidate);
            } else if (tag === "a") {
                byCategory.links.push(candidate);
            } else if (tag === "input") {
                byCategory.inputs.push(candidate);
            } else if (tag === "select") {
                byCategory.selects.push(candidate);
            } else if (tag === "textarea") {
                byCategory.textareas.push(candidate);
            } else if (role === "menuitem") {
                byCategory.menuItems.push(candidate);
            } else if (tag.startsWith("h")) {
                byCategory.headings.push(candidate);
            } else if (isToggle) {
                byCategory.toggles.push(candidate);
            } else {
                byCategory.other.push(candidate);
            }

            // Group by Purpose
            if (isHeading) {
                byPurpose.textAssertions.push(candidate);
            }
            if (isMedia) {
                byPurpose.visuals.push(candidate);
            }
            if (isClickable) {
                byPurpose.clickables.push(candidate);
            }
            if (isInput) {
                byPurpose.inputs.push(candidate);
            }
            if (inSidebar && isClickable) {
                byPurpose.navigation.push(candidate);
            }
        };

        // Performance: Scrape all target tags in one go
        $root
            .find(
                'button,a,[role="menuitem"],[role="button"],input,select,textarea,h1,h2,h3,h4,h5,h6,img,svg,[role="img"]'
            )
            .each((_, el) => {
                pushCandidate(el);
            });

        return {
            meta: {
                url: $root[0]?.baseURI || doc.location.href,
                harvestedAt: new Date().toISOString(),
                rootSelector,
            },
            byCategory,
            byPurpose,
            all: candidates,
        };
    });
};

/**
 * Saves harvested data to a JSON fixture file.
 * Filename format: data/harvests/[env]/[spec-name]_harvest.json
 * @param {Object} data - The scraped DOM data.
 * @param {string|Object} [options] - Folder string shorthand or options object:
 *  {
 *    folder: 'auth',         // Optional subfolder in fixtures
 *    fileName: 'custom.json' // Optional custom filename override
 *  }
 */
export const saveHarvest = (data, options = null) => {
    const opts = typeof options === "string" ? { folder: options } : options || {};
    const { folder: alternateFolder = null, fileName: fileNameOverride = null } = opts;

    // Extract just the filename without path or .cy.js extension
    const specName = Cypress.spec.name.split(/[/\\]/).pop().replace('.cy.js', '');
    const env = Cypress.env('ENV_NAME') || 'default';

    // Naming convention: suite_name_harvest.json
    const fileName = fileNameOverride || `${specName}_harvest.json`;

    // If alternateFolder is provided, use it. Otherwise use the default environment-based path.
    const folderPath = alternateFolder
        ? `cypress/fixtures/${alternateFolder}`
        : `cypress/fixtures/data/harvests/${env}`;

    const filePath = `${folderPath}/${fileName}`;

    cy.writeFile(filePath, data);
    cy.log(`DOM Harvest saved to: ${filePath}`);
    return cy.wrap(filePath);
};
