import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";
import svgr from "vite-plugin-svgr";

export function defineViteConfig(config) {
  const root = process.cwd();
  return defineConfig({
    plugins: [
      tanstackRouter({
        autoCodeSplitting: true,
        routesDirectory: "./src/pages",
        generatedRouteTree: "./src/routeTree.gen.ts",
        routeFileIgnorePrefix: "-",
        quoteStyle: "double",
        semicolons: true,
      }),
      react(),
      tailwindcss(),
      svgr(),
      // gz包
      {
        ...viteCompression(),
        apply: "build",
      },
      // 分析生成包的大小
      visualizer({
        open: true,
      }),
      ...(config.plugins || []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(root, "./src"),
        ...config.resolve?.alias,
      },
      extensions: [
        ".ts",
        ".tsx",
        ".js",
        "jsx",
        ...(config.resolve?.extensions || []),
      ],
    },
    css: {
      transformer: "lightningcss",
      lightningcss: {
        targets: browserslistToTargets(browserslist(">= 0.25%")),
      },
      ...config.css,
    },
    build: {
      cssCodeSplit: true,
      cssMinify: "lightningcss",
      ...config.build,
    },
    ...config,
  });
}
