import { getAllThemesFromStorage } from "./storage";

/**
 * 生成主题作用域标识
 */
export const generateThemeScope = (id: string) => `theme-scope-${id}`;

/**
 * 客户端初始化主题
 */
export const getInitialTheme = ({
  storageKey,
  id,
  themes,
  enableSystem,
  systemTheme,
  defaultTheme,
  forcedTheme,
  initStorage,
}: {
  storageKey: string;
  id: string;
  themes: string[];
  enableSystem: boolean;
  systemTheme: "light" | "dark";
  defaultTheme: string;
  forcedTheme?: string;
  initStorage?: () => void;
}): string => {
  // 强制主题优先级最高
  if (forcedTheme && themes.includes(forcedTheme)) {
    return forcedTheme;
  }

  try {
    const allThemes = getAllThemesFromStorage(storageKey);
    const storedTheme = allThemes[id];

    // 存储有值则使用
    if (storedTheme && themes.includes(storedTheme)) {
      return storedTheme;
    }

    // 存储无值时的回调（初始化存储）
    if (initStorage) {
      initStorage();
    }

    // 跟随系统主题
    if (enableSystem) {
      return systemTheme;
    }
  } catch (e) {
    console.warn("使用默认主题:", e);
  }

  // 最终 fallback 到默认主题
  return themes.includes(defaultTheme) ? defaultTheme : themes[0];
};

import type { Attribute } from "../types";

/**
 * 应用主题到DOM元素
 * @param element 目标元素
 * @param theme 主题值
 * @param attribute 应用方式（class或data-*）
 * @param themes 所有可用主题
 */
export const applyThemeToElement = ({
  element,
  theme,
  attribute,
  themes,
  enableColorScheme,
  systemTheme,
}: {
  element: HTMLElement;
  theme: string;
  attribute: Attribute;
  themes: string[];
  enableColorScheme: boolean;
  systemTheme: "light" | "dark";
}) => {
  const resolvedTheme = theme === "system" ? systemTheme : theme;
  if (attribute === "class") {
    // class模式：移除所有主题class，添加当前主题
    themes.forEach((t) => {
      element.classList.remove(t);
    });
    element.classList.add(resolvedTheme);
  } else {
    // data-*模式：设置属性值
    const attrName = attribute.startsWith("data-")
      ? attribute
      : `data-${attribute}`;
    element.setAttribute(attrName, resolvedTheme);
  }
  if (enableColorScheme) {
    element.style.colorScheme = resolvedTheme;
  }
};

/**
 * 监听系统主题变化
 * @param callback 系统主题变化时的回调
 * @returns 清理函数
 */
export const handleSystemThemeChange = (
  callback: (theme: "light" | "dark") => void
) => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches ? "dark" : "light");
  };

  // 初始触发一次
  callback(mediaQuery.matches ? "dark" : "light");
  mediaQuery.addEventListener("change", handleChange);

  return () => mediaQuery.removeEventListener("change", handleChange);
};
