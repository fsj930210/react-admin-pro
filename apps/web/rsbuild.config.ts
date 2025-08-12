import { defineRsbuildBaseConfig } from "@rap/rsbuild-config/base";
import { defineRsbuildDevConfig } from "@rap/rsbuild-config/development";
import { defineRsbuildProdConfig } from "@rap/rsbuild-config/production";
import { loadEnv, mergeRsbuildConfig } from "@rsbuild/core";

const { parsed } = loadEnv();

const baseConfig = defineRsbuildBaseConfig({});
const devConfig = defineRsbuildDevConfig({
	server: {
		port: Number(parsed.RAP_WEB_APP_PORT) || 3000,
		open: true,
	},
});
const prodConfig = defineRsbuildProdConfig({});
export default mergeRsbuildConfig(baseConfig, devConfig, prodConfig);
