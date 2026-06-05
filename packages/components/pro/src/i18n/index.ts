import { registerI18nResources } from "@rap/i18n";
import enUS from "./en-US";
import zhCN from "./zh-CN";

export function registerProI18n() {
  registerI18nResources("pro", {
    "zh-CN": zhCN,
    "en-US": enUS,
  });
}
