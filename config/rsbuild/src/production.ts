import {
	defineConfig as defineRsbuildConfig,
	type RsbuildConfig,
} from "@rsbuild/core";

const needAnalyzer = process.env.analyzer;

export function defineRsbuildProdConfig(options: RsbuildConfig) {
	return defineRsbuildConfig({
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
					...options.performance?.chunkSplit?.override,
				},
				...options.performance?.chunkSplit,
			},
			...options.performance,
		},
		...options,
	});
}
