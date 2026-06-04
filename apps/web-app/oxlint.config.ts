import { defineRapOxlintConfig } from "@rap/oxc-config/oxlint";

export default defineRapOxlintConfig({
  ignorePatterns: ["src/routeTree.gen.ts", "public/mockServiceWorker.js"],
});
