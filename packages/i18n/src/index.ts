import i18next, { type InitOptions, type ResourceLanguage } from "i18next";
import { initReactI18next } from "react-i18next";

export { I18nextProvider, Trans, useTranslation, withTranslation } from "react-i18next";
export type { TFunction } from "i18next";

export const DEFAULT_LOCALE = "zh-CN";
export const I18N_LANGUAGE_STORAGE_KEY = "rap-i18n-language";

export type Locale = "zh-CN" | "en-US";
export type I18nResourceMap = Partial<Record<Locale, ResourceLanguage>>;

export const supportedLocales: Locale[] = ["zh-CN", "en-US"];

export const i18n = i18next.createInstance();

function getInitialLocale(locale?: Locale): Locale {
  if (locale) return locale;
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const storedLocale = window.localStorage.getItem(I18N_LANGUAGE_STORAGE_KEY);
  if (supportedLocales.includes(storedLocale as Locale)) return storedLocale as Locale;

  const browserLocale = window.navigator.language;
  if (browserLocale.toLowerCase().startsWith("zh")) return "zh-CN";
  return "en-US";
}

export async function initI18n(locale?: Locale, options?: InitOptions) {
  if (i18n.isInitialized) return i18n;

  await i18n.use(initReactI18next).init({
    lng: getInitialLocale(locale),
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: "common",
    ns: ["common"],
    resources: {},
    interpolation: {
      escapeValue: false,
    },
    ...options,
  });

  return i18n;
}

export function registerI18nResources(namespace: string, resources: I18nResourceMap) {
  for (const [locale, resource] of Object.entries(resources)) {
    if (!resource) continue;
    i18n.addResourceBundle(locale, namespace, resource, true, true);
  }
}

export async function changeLanguage(locale: Locale) {
  await i18n.changeLanguage(locale);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(I18N_LANGUAGE_STORAGE_KEY, locale);
  }
}

export function applyI18nResourceOverrides(
  locale: Locale,
  namespace: string,
  resources: ResourceLanguage
) {
  i18n.addResourceBundle(locale, namespace, resources, true, true);
  i18n.emit("languageChanged", i18n.language);
}
