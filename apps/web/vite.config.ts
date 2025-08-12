import { defineViteConfig } from "@rap/vite-config";
import { loadEnv } from "vite";

export default ({ mode }) => {
	const root = process.cwd();
	const envConfig = loadEnv(mode, root);
	return defineViteConfig({
		envPrefix: envConfig.ENV_PREFIX || "RAP_WEB",
		base: envConfig.RAP_WEB_PUBLIC_PATH,
		server: {
			port: Number(envConfig.RAP_WEB_PORT) || 3000,
			open: true,
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
