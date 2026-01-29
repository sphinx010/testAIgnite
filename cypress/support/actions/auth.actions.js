/**
 * AUTH ACTIONS
 * 
 * High-level abstractions for authentication flows.
 * 
 * @usage
 * import { login } from "../support/actions/auth.actions";
 * login({ email: 'user@example.com', password: 'password' });
 */

import "../commands";
import { clickButton } from "./buttons.actions";
import { typeInput } from "./inputs.actions";

export const login = ({ email, password }) => {
  typeInput("auth.emailInput", email);
  typeInput("auth.passwordInput", password);
  clickButton("auth.loginButton");
};
