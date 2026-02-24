import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/", "eslint.config.mjs"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        document: "readonly",
        window: "readonly",
        localStorage: "readonly",
        setTimeout: "readonly",
        console: "readonly",
        fetch: "readonly",
        confirm: "readonly",
        encodeURIComponent: "readonly",
        alert: "readonly",
        HTMLElement: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { caughtErrors: "none" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
];
