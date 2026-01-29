/**
 * MODULE 3: Environment Configuration Helpers
 * 
 * Provides a clean API for tests to consume configuration without
 * knowing about the underlying storage or environment profile.
 */

/**
 * Access the full merged configuration object.
 * @usage const cfg = getEnvConfig();
 */
export const getEnvConfig = () => {
  const cfg = Cypress.env("envConfig") || {};
  return cfg;
};

export const getBaseUrl = () => {
  const cfg = getEnvConfig();
  return cfg.baseUrl || Cypress.config("baseUrl");
};

export const getApiBaseUrl = () => {
  const cfg = getEnvConfig();
  return cfg.apiBaseUrl;
};
