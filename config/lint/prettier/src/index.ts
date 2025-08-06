import type { Config } from "prettier";

export function definePrettierConfig(userConfig: Config) {
	return {
		endOfLine: "auto",
		overrides: [
			{
				files: ["*.json5"],
				options: {
					quoteProps: "preserve",
					singleQuote: false,
				},
			},
		],
		plugins: ["prettier-plugin-tailwindcss"],
		printWidth: 100,
		proseWrap: "never",
		semi: true,
		singleQuote: false,
		trailingComma: "all",
		tabWidth: 2,
		...userConfig,
	};
}
