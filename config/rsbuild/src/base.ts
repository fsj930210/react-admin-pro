import path from 'node:path'
import { defineConfig as defineRsbuildConfig, type RsbuildConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import { pluginTypeCheck } from "@rsbuild/plugin-type-check";

export function defineBaseConfig(options: RsbuildConfig) {
	const root = process.cwd()
	return defineRsbuildConfig({
		plugins: [
			...(options.plugins || []), 
			pluginReact(), 
			pluginSvgr(),
			pluginTypeCheck()
	],
		resolve: {
			alias: {
				'@': path.resolve(root, './src'),
			},
			...options.resolve
		},
		html: {
			template: './public/index.html',
			...options.html
		},
		output: {
			cleanDistPath: true,
			...options.output
		},
		...options
	});
}
