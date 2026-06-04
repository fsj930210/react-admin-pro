import { defineConfig, type OxfmtConfig } from "oxfmt";

const baseConfig: OxfmtConfig = defineConfig({
	printWidth: 100,
	tabWidth: 2,
	useTabs: false,
	semi: true,
	singleQuote: false,
	jsxSingleQuote: false,
	trailingComma: "es5",
	bracketSpacing: true,
	arrowParens: "always",
	endOfLine: "lf",
	insertFinalNewline: true,
	sortPackageJson: false,
	ignorePatterns: [
		"dist/**",
		"build/**",
		"coverage/**",
		"node_modules/**",
		"tsconfig.tsbuildinfo",
		"routeTree.gen.ts",
		"public/mockServiceWorker.js",
	],
});

export function defineRapOxfmtConfig(config: OxfmtConfig = {}): OxfmtConfig {
	return defineConfig({
		...baseConfig,
		...config,
		ignorePatterns: [...(baseConfig.ignorePatterns ?? []), ...(config.ignorePatterns ?? [])],
		overrides: [...(baseConfig.overrides ?? []), ...(config.overrides ?? [])],
	});
}

export default baseConfig;
