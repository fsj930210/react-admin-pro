import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type UserConfig, mergeConfig } from "vite";
import viteCompression from "vite-plugin-compression";
import svgr from "vite-plugin-svgr";
import { codeInspectorPlugin } from 'code-inspector-plugin';
import { pluginReactLocalIconify } from './plugins/react-local-iconify.ts';

export function defineViteConfig(config: UserConfig = {}) {
  const root = process.cwd();
  
  // 基础配置
  const baseConfig = defineConfig({
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
      {
        ...viteCompression(),
        apply: "build",
      },
      visualizer({
        open: true,
      }),
      codeInspectorPlugin({
        bundler: 'vite',
      }),
      pluginReactLocalIconify({
        resolver: '@iconify/react',
        configs: [
          {
            dir: './src/assets/icons',
            monotone: false,
            prefix: 'rap-icon',
            provider: 'rap-icon',
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(root, "./src"),
      },
      extensions: [
        ".ts",
        ".tsx",
        ".js",
        "jsx",
      ],
    },
    css: {
      transformer: "lightningcss",
      lightningcss: {
        targets: browserslistToTargets(browserslist(">= 0.25%")),
      },
    },
    build: {
      cssCodeSplit: true,
      cssMinify: "lightningcss",
    },
  });

  // 使用 mergeConfig 合并配置
  return mergeConfig(baseConfig, config);
}