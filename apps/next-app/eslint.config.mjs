import rapEslintConfig from "@rap/eslint-config";
import { defineConfig } from "eslint/config";
import biome from "eslint-config-biome";

export default defineConfig([
	{
		files: ["app/**/*.{ts,tsx}"],
		extends: [rapEslintConfig.configs.recommended],
		rules: {
			...rapEslintConfig.rules,
		},
	},
	{
		rules: {
			"@next/next/no-img-element": "off",
		},
	},
	biome,
]);
