export function defineStylelintConfig() {
	return {
		extends: ["stylelint-config-standard", "stylelint-config-recess-order"],
		ignoreFiles: [
			"**/*.js",
			"**/*.jsx",
			"**/*.tsx",
			"**/*.ts",
			"**/*.json",
			"**/*.md",
		],
		plugins: ["stylelint-order", "@stylistic/stylelint-plugin"],
		rules: {
			"at-rule-no-deprecated": null,
			"font-family-no-missing-generic-family-keyword": null,
			"function-no-unknown": null,
			"import-notation": null,
			"media-feature-range-notation": null,
			"named-grid-areas-no-invalid": null,
			"no-empty-source": null,
			"selector-class-pattern": null,
			"selector-pseudo-class-no-unknown": null,
			"no-descending-specificity": null,
			"selector-pseudo-element-no-unknown": null,
			"rule-empty-line-before": [
				"always",
				{
					ignore: ["after-comment", "first-nested"],
				},
			],
		},
	};
}
