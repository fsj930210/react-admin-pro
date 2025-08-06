import { defineBaseConfig } from "@rap/rsbuild-config/base";
import { defineDevConfig } from "@rap/rsbuild-config/development";
import { defineProdConfig } from "@rap/rsbuild-config/production";
import { mergeRsbuildConfig } from "@rsbuild/core";
import { tanstackRouter } from "@tanstack/router-plugin/rspack";

const baseConfig = defineBaseConfig({
	tools: {
		rspack: {
			plugins: [
				tanstackRouter({
					target: "react",
					autoCodeSplitting: true,
					routesDirectory: "./src/pages",
					generatedRouteTree: "./src/routeTree.gen.ts",
					routeFileIgnorePrefix: "-",
					quoteStyle: "double",
					semicolons: true,
				}),
			],
		},
	},
});
const devConfig = defineDevConfig({});
const prodConfig = defineProdConfig({});
export default mergeRsbuildConfig(baseConfig, devConfig, prodConfig);
