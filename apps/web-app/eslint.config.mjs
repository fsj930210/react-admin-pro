import rapEslintConfig from "@rap/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";
import biome from "eslint-config-biome";

export default defineConfig([
	globalIgnores(["src/routeTree.gen.ts"]),
	{
		files: ["src/**/*.{ts,tsx}"],
		extends: [rapEslintConfig],
	},
	biome,
]);
