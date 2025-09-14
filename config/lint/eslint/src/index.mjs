import js from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tsEslint from "typescript-eslint";

export default [
  reactRefresh.configs.vite,
  reactHooks.configs["recommended-latest"],
  eslintReact.configs["recommended-typescript"],
  tsEslint.configs.strict,
  tsEslint.configs.stylistic,
  js.configs.recommended,
  tsEslint.configs.recommended,
  pluginQuery.configs["flat/recommended"],
  pluginRouter.configs["flat/recommended"],
  {
    files: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsEslint.parser,
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: { react: { version: "detect" } },
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
  }
]