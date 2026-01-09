import { defineRsbuildBaseConfig } from "@rap/rsbuild-config/base";
import { defineRsbuildDevConfig } from "@rap/rsbuild-config/development";
import { defineRsbuildProdConfig } from "@rap/rsbuild-config/production";
import { loadEnv, mergeRsbuildConfig } from "@rsbuild/core";

const { parsed, publicVars } = loadEnv({ prefixes: ["RAP_WEB_"] });

const baseConfig = defineRsbuildBaseConfig({
	source: {
		define: publicVars,
	},
	output: {
		assetPrefix: parsed.RAP_WEB_APP_BASE_URL,
	},
	html: {
		favicon: "./public/logo.svg",
		title: "React Admin Pro",
	},
});
const devConfig = defineRsbuildDevConfig({
	server: {
		port: Number(parsed.RAP_WEB_APP_PORT) || 3000,
		open: false,
		base: parsed.RAP_WEB_APP_BASE_URL,
	},
	tools: {
		rspack: {
			watchOptions: {
				ignored: ["/node_modules/", "**/.turbo", "**/dist", "**/build"],
				aggregateTimeout: 200,
				poll: 100,
			},
		},
	},
});
const prodConfig = defineRsbuildProdConfig({});
export default mergeRsbuildConfig(baseConfig, devConfig, prodConfig);
