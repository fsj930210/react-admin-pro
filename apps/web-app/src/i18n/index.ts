import { registerI18nResources } from "@rap/i18n";
import enUS from "./en-US";
import zhCN from "./zh-CN";

export function registerWebAppI18n() {
  registerI18nResources("webApp", {
    "zh-CN": zhCN,
    "en-US": enUS,
  });
}
