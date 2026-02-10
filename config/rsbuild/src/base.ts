import path from "node:path";
import {
	defineConfig as defineRsbuildConfig,
	type RsbuildConfig,
	mergeRsbuildConfig,
} from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import { pluginTypeCheck } from "@rsbuild/plugin-type-check";
import { tanstackRouter } from "@tanstack/router-plugin/rspack";
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { pluginReactLocalIconify } from './plugins/react-local-iconify'

export function defineRsbuildBaseConfig(options: RsbuildConfig = {}) {
	const root = process.cwd();
	const srcDir = path.resolve(root, "./src");

	// 基础配置
	const baseConfig = defineRsbuildConfig({
		plugins: [
			pluginReact(),
			pluginSvgr(),
			pluginTypeCheck(),
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
				"@": srcDir,
			},
		},
		html: {
			template: "./public/index.html",
		},
		output: {
			cleanDistPath: true,
		},
		tools: {
			rspack: {
				plugins: [
					tanstackRouter({
						target: "react",
						autoCodeSplitting: true,
						routesDirectory: path.resolve(srcDir, "pages"),
						generatedRouteTree: path.resolve(
							srcDir,
							'routeTree.gen.ts'
						  ),
						routeFileIgnorePrefix: "-",
						quoteStyle: "double",
						semicolons: true,
					}),
					codeInspectorPlugin({
						bundler: 'rspack',
					}),
				],
			},
		},
	});

	// 使用 mergeRsbuildConfig 合并基础配置和用户配置
	return mergeRsbuildConfig(baseConfig, options);
}
