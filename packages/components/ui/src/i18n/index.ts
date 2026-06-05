import { registerI18nResources } from "@rap/i18n";
import enUS from "./en-US";
import zhCN from "./zh-CN";

export function registerUiI18n() {
  registerI18nResources("ui", {
    "zh-CN": zhCN,
    "en-US": enUS,
  });
}
