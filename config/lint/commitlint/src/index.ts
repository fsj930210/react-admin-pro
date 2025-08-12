import type { UserConfig } from "@commitlint/types";
export function defineCommitlintConfig(
	userConfig: UserConfig = {},
): UserConfig {
	return {
		extends: ["@commitlint/config-conventional"],
		...userConfig,
	};
}
