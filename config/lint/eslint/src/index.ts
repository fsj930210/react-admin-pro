import antfu from "@antfu/eslint-config";
import type { FirstParameter, RestParameters } from "@rap/types/type-utils";
import pluginQuery from "@tanstack/eslint-plugin-query";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export function defineEslintConfig(
	antfuConfig: FirstParameter<typeof antfu>,
	userConfig: RestParameters<typeof antfu>,
) {
	return antfu(
		{ ...antfuConfig },
		{
			settings: { react: { version: "detect" } },
			...pluginQuery.configs["flat/recommended"],
		},
		{ ...userConfig },
		{ ...eslintConfigPrettier },
	);
}
