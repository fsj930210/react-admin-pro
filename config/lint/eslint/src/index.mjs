import js from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tsEslint from "typescript-eslint";

export default {
  meta: {
    name: "@rap/eslint-config",
    version: "0.0.1",
  },
  configs: {
    recommended: tsEslint.config({
      files: ["src/**/*.{ts,tsx}"],
      extends: [
        js.configs.recommended,
        tsEslint.configs.recommended,
        eslintReact.configs["recommended-typescript"],
        reactHooks.configs["recommended-latest"],
        reactRefresh.configs.vite,
        pluginQuery.configs["flat/recommended"],
        pluginRouter.configs["flat/recommended"],
      ],
      languageOptions: {
        parser: tsEslint.parser,
        ecmaVersion: 2020,
        globals: globals.browser,
      },
      settings: { react: { version: "detect" } },
    }),
  },
  rules: {
    "no-unused-vars": "error",
    "no-tabs": [2, { allowIndentationTabs: true }],
    indent: [2, "tab", { SwitchCase: 1 }],
    quotes: [2, "double", { avoidEscape: true }],
    semi: [2, "always"],
    "react-refresh/only-export-components": [
      "off",
      { allowConstantExport: true },
    ],
    "no-console": "error",
  },
};
