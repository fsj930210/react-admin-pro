import { defineRapOxlintConfig } from "@rap/oxc-config/oxlint";

export default defineRapOxlintConfig({
  rules: {
    "react-hooks/exhaustive-deps": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/interactive-supports-focus": "off",
    "jsx-a11y/mouse-events-have-key-events": "off",
    "jsx-a11y/no-noninteractive-element-interactions": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "jsx-a11y/prefer-tag-over-role": "off",
    "jsx-a11y/role-supports-aria-props": "off",
  },
});
