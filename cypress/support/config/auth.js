/**
 * MODULE 3: Credential Management
 * 
 * Securely fetch role-based credentials from the current environment profile.
 */

import { getEnvConfig } from "./env";

/**
 * Get credentials for a specific role (e.g., 'admin', 'editor').
 * @usage const { email, password } = getCredentials('admin');
 */
export const getCredentials = (role) => {
  const cfg = getEnvConfig();
  const creds = cfg.roles?.[role];
  if (!creds) {
    throw new Error(`Credentials not found for role "${role}"`);
  }
  return creds;
};
