import js from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";
import { defineConfig } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tsEslint from "typescript-eslint";

export default defineConfig(
  js.configs.recommended,
  tsEslint.configs.recommendedTypeChecked,
  tsEslint.configs.stylisticTypeChecked,
  reactRefresh.configs.vite,
  reactHooks.configs.flat.recommended,
  pluginQuery.configs["flat/recommended"],
  pluginRouter.configs["flat/recommended"],
  eslintReact.configs["recommended-typescript"],
  [
    {
      files: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
      languageOptions: {
        parser: tsEslint.parser,
        ecmaVersion: 2020,
        globals: globals.browser,
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
      settings: { react: { version: "detect" } },
      rules: {
        "no-unused-vars": "error",
        "no-tabs": [2, { allowIndentationTabs: true }],
        indent: [2, "tab", { SwitchCase: 1 }],
        quotes: [2, "double", { avoidEscape: true }],
        semi: [2, "always"],
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
				"@typescript-eslint/no-unsafe-member-access": "off",
				"@typescript-eslint/no-unsafe-argument": "off",
				"@eslint-react/no-nested-component-definitions": "off",
				"@eslint-react/naming-convention/use-state": "off",
        "react-refresh/only-export-components": [
          "off",
          { allowConstantExport: true },
        ],
      },
    },
  ]
);
