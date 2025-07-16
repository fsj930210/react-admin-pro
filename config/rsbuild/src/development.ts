import { defineConfig as defineRsbuildConfig, type RsbuildConfig } from "@rsbuild/core";


export function defineDevConfig(options: RsbuildConfig) {
  return defineRsbuildConfig({
    dev: {
      progressBar: true,
      lazyCompilation: true,
      ...options.dev
    },
    server: {
      port: options.server?.port,
      open: true,
      proxy: {
        ...options.server?.proxy
      },
      ...options.server
    },
    tools: {
      rspack: (config, { isDev }) => {
        if (isDev) {
          config.devtool = 'eval-cheap-source-map';
        }
        return config;
      },
    },
    ...options
  });
}
