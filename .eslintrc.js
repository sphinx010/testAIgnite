module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    "cypress/globals": true
  },
  extends: ["eslint:recommended", "plugin:cypress/recommended"],
  plugins: ["cypress"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module"
  },
  rules: {
    "no-console": "warn",
    "cypress/no-force": "warn",
    "cypress/no-unnecessary-waiting": "warn",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "prefer-const": "warn"
  }
};
