import { codeInspectorPlugin } from "code-inspector-plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	basePath: process.env.NEXT_PUBLIC_NEXT_APP_BASE_URL,
	output: "standalone",
	typedRoutes: true,
	reactStrictMode: true,
	turbopack: {
		rules: codeInspectorPlugin({
			bundler: "turbopack",
		}),
	},
	eslint: {
		dirs: ["app", "config"],
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
