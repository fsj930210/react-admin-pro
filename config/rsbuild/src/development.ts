import {
	defineConfig as defineRsbuildConfig,
	type RsbuildConfig,
} from "@rsbuild/core";

export function defineRsbuildDevConfig(options: RsbuildConfig) {
	return defineRsbuildConfig({
		dev: {
			progressBar: true,
			lazyCompilation: true,
			...options.dev,
		},
		tools: {
			rspack: (config, { isDev }) => {
				if (isDev) {
					config.devtool = "eval-cheap-source-map";
				}
				return config;
			},
		},
		...options,
	});
}
