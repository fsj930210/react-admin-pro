import { defineViteConfig } from "@rap/vite-config";
import { loadEnv, type UserConfig } from "vite";

export default ({ mode }: UserConfig) => {
	const root = process.cwd();
	const envConfig = loadEnv(mode || "development", root, ["RAP_WEB_"]);

	return defineViteConfig({
		envPrefix: "RAP_WEB_",
		base: envConfig.RAP_WEB_APP_BASE_URL,
		server: {
			port: Number(envConfig.RAP_WEB_APP_PORT) || 3000,
			open: false,
			allowedHosts: true,
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks: {
						react: ["react", "react-dom"],
					},
					chunkFileNames: "static/js/[name]-[hash].js",
					entryFileNames: "static/js/[name]-[hash].js",
					assetFileNames: "static/[ext]/[name]-[hash].[ext]",
				},
			},
		},
	});
};
