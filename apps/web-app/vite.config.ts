import { defineViteConfig } from "@rap/vite-config";
import { loadEnv, type UserConfig } from "vite";

export default ({ mode }: UserConfig) => {
  const root = process.cwd();
  const envConfig = loadEnv(mode || "development", root, ["RAP_WEB_"]);

  return defineViteConfig({
    envPrefix: "RAP_WEB_",
    base: envConfig.RAP_WEB_APP_BASE_URL,
    server: {
      port: Number(envConfig.RAP_WEB_APP_PORT) || 3000,
      open: false,
      allowedHosts: true,
    },
    build: {
      rolldownOptions: {
        checks: {
          pluginTimings: false,
        },
        output: {
          codeSplitting: {
            groups: [
              {
                name: "react",
                test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              },
              {
                name: "echarts",
                test: /[\\/]node_modules[\\/](echarts|zrender)[\\/]/,
              },
              {
                name: "tanstack-router-query",
                test: /[\\/]node_modules[\\/]@tanstack[\\/](react-query|query-core|react-router|router-core|history|store|react-store)[\\/]/,
              },
              {
                name: "tanstack-data",
                test: /[\\/]node_modules[\\/]@tanstack[\\/](react-table|table-core|react-virtual|virtual-core|react-form|form-core)[\\/]/,
              },
              {
                name: "radix",
                test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              },
              {
                name: "iconify-icons",
                test: /[\\/]node_modules[\\/]@iconify-json[\\/]/,
              },
              {
                name: "iconify",
                test: /[\\/]node_modules[\\/]@iconify[\\/]/,
              },
            ],
          },
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
        },
      },
      chunkSizeWarningLimit: 1200,
    },
  });
};
