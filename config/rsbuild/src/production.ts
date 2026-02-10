import {
	defineConfig as defineRsbuildConfig,
	type RsbuildConfig,
	mergeRsbuildConfig,
} from "@rsbuild/core";

const needAnalyzer = process.env.analyzer;

export function defineRsbuildProdConfig(options: RsbuildConfig = {}) {
	// 基础生产配置
	const baseProdConfig = defineRsbuildConfig({
		performance: {
			removeConsole: true,
			preload: {
				type: "async-chunks",
			},
			bundleAnalyze: needAnalyzer
				? {
						analyzerMode: "server",
						openAnalyzer: true,
						analyzerPort: 5001,
					}
				: undefined,
			chunkSplit: {
				strategy: "split-by-size",
				override: {
					cacheGroups: {
						react: {
							test: /node_modules[\\/](react|react-dom)[\\/]/,
							name: "react",
							chunks: "all",
						},
					},
				},
			},
		},
	});

	// 使用 mergeRsbuildConfig 合并配置
	return mergeRsbuildConfig(baseProdConfig, options);
}
