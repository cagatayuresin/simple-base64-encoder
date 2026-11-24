import js from "@eslint/js";

const browserGlobals = {
  atob: "readonly",
  Blob: "readonly",
  btoa: "readonly",
  clearTimeout: "readonly",
  console: "readonly",
  document: "readonly",
  setTimeout: "readonly",
  File: "readonly",
  FileReader: "readonly",
  gtag: "readonly",
  localStorage: "readonly",
  navigator: "readonly",
  TextDecoder: "readonly",
  TextEncoder: "readonly",
  URL: "readonly",
  window: "readonly",
};

export default [
  {
    ignores: ["node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["src/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: browserGlobals,
    },
  },
  {
    files: ["sw.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        caches: "readonly",
        clients: "readonly",
        console: "readonly",
        fetch: "readonly",
        Response: "readonly",
        self: "readonly",
      },
    },
  },
  {
    files: ["tests/**/*.js", "eslint.config.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        File: "readonly",
      },
    },
  },
];
