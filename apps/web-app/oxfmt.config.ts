import { defineRapOxfmtConfig } from "@rap/oxc-config/oxfmt";

export default defineRapOxfmtConfig({
  ignorePatterns: ["src/routeTree.gen.ts", "public/mockServiceWorker.js"],
});
