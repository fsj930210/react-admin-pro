import { defineConfig, type OxlintConfig } from "oxlint";

const baseConfig: OxlintConfig = defineConfig({
	plugins: ["typescript", "unicorn", "oxc", "import", "react", "jsx-a11y", "react-perf"],
	env: {
		browser: true,
		es2023: true,
		node: true,
	},
	settings: {
		react: {
			version: "19.2.5",
		},
	},
	ignorePatterns: [
		"dist/**",
		"build/**",
		"coverage/**",
		"node_modules/**",
		"tsconfig.tsbuildinfo",
		"routeTree.gen.ts",
		"public/mockServiceWorker.js",
	],
	rules: {
		"no-console": "warn",
		"react/react-in-jsx-scope": "off",
		"react/self-closing-comp": ["warn", { component: true, html: true }],
	},
});

export function defineRapOxlintConfig(config: OxlintConfig = {}): OxlintConfig {
	return defineConfig({
		...baseConfig,
		...config,
		env: {
			...baseConfig.env,
			...config.env,
		},
		settings: {
			...baseConfig.settings,
			...config.settings,
		},
		ignorePatterns: [...(baseConfig.ignorePatterns ?? []), ...(config.ignorePatterns ?? [])],
		plugins: config.plugins ?? baseConfig.plugins,
		rules: {
			...baseConfig.rules,
			...config.rules,
		},
		overrides: [...(baseConfig.overrides ?? []), ...(config.overrides ?? [])],
	});
}

export default baseConfig;
