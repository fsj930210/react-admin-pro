import {
	defineConfig as defineRsbuildConfig,
	type RsbuildConfig,
	mergeRsbuildConfig,
} from "@rsbuild/core";

export function defineRsbuildProdConfig(options: RsbuildConfig = {}) {
	// 基础生产配置
	const baseProdConfig = defineRsbuildConfig({
		performance: {
			removeConsole: true,
			preload: {
				type: "async-chunks",
			},
			chunkSplit: {
				strategy: "split-by-size",
				override: {
					cacheGroups: {
						react: {
							test: /node_modules[\\/](react|react-dom)[\\/]/,
							name: "react",
							chunks: "all",
						},
						iconifyIcons: {
							test: /node_modules[\\/]@iconify-json[\\/]/,
							name: "iconify-icons",
							chunks: "all",
							priority: 45,
						},
						iconify: {
							test: /node_modules[\\/](@iconify|@iconify-json)[\\/]/,
							name: "iconify",
							chunks: "all",
							priority: 40,
						},
						echarts: {
							test: /node_modules[\\/](echarts|zrender)[\\/]/,
							name: "echarts",
							chunks: "all",
							priority: 30,
						},
						tiptap: {
							test: /node_modules[\\/](@tiptap|prosemirror-[^\\/]+|lowlight|highlight\.js|marked|linkifyjs|orderedmap)[\\/]/,
							name: "tiptap",
							chunks: "all",
							priority: 30,
						},
						pinyin: {
							test: /node_modules[\\/]pinyin-pro[\\/]/,
							name: "pinyin-pro",
							chunks: "all",
							priority: 30,
						},
						tanstackRouterQuery: {
							test: /node_modules[\\/]@tanstack[\\/](react-query|query-core|react-router|router-core|history|store|react-store)[\\/]/,
							name: "tanstack-router-query",
							chunks: "all",
							priority: 20,
						},
						tanstackData: {
							test: /node_modules[\\/]@tanstack[\\/](react-table|table-core|react-virtual|virtual-core|react-form|form-core)[\\/]/,
							name: "tanstack-data",
							chunks: "all",
							priority: 20,
						},
						radix: {
							test: /node_modules[\\/]@radix-ui[\\/]/,
							name: "radix",
							chunks: "all",
							priority: 20,
						},
						dnd: {
							test: /node_modules[\\/]@dnd-kit[\\/]/,
							name: "dnd-kit",
							chunks: "all",
							priority: 20,
						},
					},
				},
			},
		},
	});

	// 使用 mergeRsbuildConfig 合并配置
	return mergeRsbuildConfig(baseProdConfig, options);
}
