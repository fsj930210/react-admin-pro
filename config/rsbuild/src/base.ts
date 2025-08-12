import path from "node:path";
import {
	defineConfig as defineRsbuildConfig,
	type RsbuildConfig,
} from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import { pluginTypeCheck } from "@rsbuild/plugin-type-check";
import { tanstackRouter } from "@tanstack/router-plugin/rspack";

export function defineRsbuildBaseConfig(options: RsbuildConfig) {
	const root = process.cwd();
	const srcDir = path.resolve(root, "./src");
	return defineRsbuildConfig({
		plugins: [
			...(options.plugins || []),
			pluginReact(),
			pluginSvgr(),
			pluginTypeCheck(),
		],
		resolve: {
			alias: {
				"@": path.resolve(root, "./src"),
			},
			...options.resolve,
		},
		html: {
			template: "./public/index.html",
			...options.html,
		},
		output: {
			cleanDistPath: true,
			...options.output,
		},
		tools: {
			rspack: {
				plugins: [
					tanstackRouter({
						target: "react",
						autoCodeSplitting: true,
						routesDirectory: path.resolve(srcDir, "pages"),
						generatedRouteTree: path.resolve(srcDir, "routeTree.gen.ts"),
						routeFileIgnorePrefix: "-",
						quoteStyle: "double",
						semicolons: true,
					}),
				],
			},
		},
		...options,
	});
}
