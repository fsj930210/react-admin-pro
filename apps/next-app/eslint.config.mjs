import nextPlugin from "@next/eslint-plugin-next";
import rapEslintConfig from "@rap/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";
import biome from "eslint-config-biome";
export default defineConfig([
	globalIgnores([
		"node_modules/**",
		".next/**",
		"out/**",
		"build/**",
		"next-env.d.ts",
		"eslint.config.mjs",
	]),
	{
		files: ["app/**/*.{ts,tsx}"],
		extends: [rapEslintConfig],
	},
	{
		files: ["app/**/*.{ts,tsx}"],
		plugins: {
			"@next/next": nextPlugin,
		},
		rules: {
			...nextPlugin.configs.recommended.rules,
			"@next/next/no-img-element": "off",
		},
	},
	biome,
]);
