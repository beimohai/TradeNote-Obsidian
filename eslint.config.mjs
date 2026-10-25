import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";

// Keep the marketplace review checks reproducible locally and in CI.
export default [{
  files: ["src/**/*.ts"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { project: "./tsconfig.json", tsconfigRootDir: import.meta.dirname },
  },
  plugins: { "@typescript-eslint": tseslint.plugin, obsidianmd },
  rules: {
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/no-deprecated": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "obsidianmd/prefer-instanceof": "error",
    "obsidianmd/no-static-styles-assignment": "error",
    "obsidianmd/no-unsupported-api": "error",
    "obsidianmd/editor-drop-paste": "error",
    "obsidianmd/settings-tab/no-manual-html-headings": "error",
    "obsidianmd/settings-tab/no-deprecated-display": "error",
    "obsidianmd/settings-tab/prefer-setting-definitions": "error",
    "obsidianmd/settings-tab/prefer-update-over-display": "error",
    "obsidianmd/settings-tab/require-display": "error",
  },
}];
