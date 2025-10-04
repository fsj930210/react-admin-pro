import type { ThemeStorage } from "../types";

/**
 * 获取所有主题存储
 */
export const getAllThemesFromStorage = (storageKey: string): ThemeStorage => {
  try {
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.warn("读取主题存储失败:", e);
    return {};
  }
};

/**
 * 保存主题到存储
 */
export const saveThemeToStorage = (
  storageKey: string,
  instanceId: string,
  theme: string
) => {
  try {
    const allThemes = getAllThemesFromStorage(storageKey);
    allThemes[instanceId] = theme;
    localStorage.setItem(storageKey, JSON.stringify(allThemes));
  } catch (e) {
    console.warn("保存主题失败:", e);
  }
};

/**
 * 从存储中移除主题
 */
export const removeThemeFromStorage = (
  storageKey: string,
  instanceId: string
) => {
  try {
    const allThemes = getAllThemesFromStorage(storageKey);
    delete allThemes[instanceId];
    localStorage.setItem(storageKey, JSON.stringify(allThemes));
  } catch (e) {
    console.warn("移除主题失败:", e);
  }
};

/**
 * 清除所有主题存储
 */
export const clearAllThemesFromStorage = (storageKey: string) => {
  try {
    localStorage.removeItem(storageKey);
  } catch (e) {
    console.warn("清除所有主题失败:", e);
  }
};
