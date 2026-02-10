import {
	defineConfig as defineRsbuildConfig,
	type RsbuildConfig,
	mergeRsbuildConfig,
} from "@rsbuild/core";

export function defineRsbuildDevConfig(options: RsbuildConfig = {}) {
	// 基础开发配置
	const baseDevConfig = defineRsbuildConfig({
		dev: {
			progressBar: true,
			lazyCompilation: true,
		},
		tools: {
			rspack: (config, { isDev }) => {
				if (isDev) {
					config.devtool = "eval-cheap-source-map";
				}
				return config;
			},
		},
	});

	// 使用 mergeRsbuildConfig 合并配置
	return mergeRsbuildConfig(baseDevConfig, options);
}
