import rapEslintConfig from "@rap/eslint-config";
import { defineConfig } from "eslint/config";
import biome from "eslint-config-biome";

export default defineConfig([
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [rapEslintConfig.configs.recommended],
    rules: {
      ...rapEslintConfig.rules,
    },
  },
  biome,
]);
