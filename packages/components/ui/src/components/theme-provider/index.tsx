"use client";
import type React from "react";
import { createContext, use, useContext, useEffect, useRef, useState } from "react";
import type { ThemeContextValue, ThemeProviderProps } from "./types";
import {
  clearAllThemesFromStorage,
  removeThemeFromStorage,
  saveThemeToStorage,
} from "./utils/storage";
import {
  applyThemeToElement,
  generateThemeScope,
  getInitialTheme,
  handleSystemThemeChange,
} from "./utils/utils";
import { cn } from "@rap/utils";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  id,
  storageKey: propStorageKey, // 允许父组件传递存储键
  themes = ["light", "dark"],
  enableSystem: propEnableSystem = false,
  enableColorScheme: propEnableColorScheme = false,
  inheritTheme = false,
  attribute = "data-theme",
  defaultTheme = "light",
  forcedTheme,
  cacheClearRecovery = "default",
	className,
}) => {
  const parentContext = useContext(ThemeContext);
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultThemeRef = useRef(defaultTheme);
  if (!id) {
    throw new Error("ThemeProvider must have an id");
  }
  if (parentContext?.id === id) {
    throw new Error("ThemeProvider id must be unique");
  }

  if (
    propStorageKey &&
    parentContext?.storageKey &&
    parentContext.storageKey !== propStorageKey
  ) {
    throw new Error(
      "ThemeProvider storageKey must match parent's storageKey if provided"
    );
  }

  const storageKey =
    parentContext?.storageKey || propStorageKey || "app-themes";

  // 生成作用域标识
  const themeScope = generateThemeScope(id);

  const shouldInherit = inheritTheme && !!parentContext && !forcedTheme;
  const isForced = !!forcedTheme && themes.includes(forcedTheme);
  const enableSystem = shouldInherit
    ? parentContext?.enableSystem || propEnableSystem
    : propEnableSystem;
  const enableColorScheme = shouldInherit
    ? parentContext?.enableColorScheme || propEnableColorScheme
    : propEnableColorScheme;
  // 系统主题状态
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  // 主题状态初始化
  const [theme, setThemeState] = useState<string>(() => {
    if (shouldInherit && parentContext) {
      return parentContext.theme;
    }
    const initialTheme = getInitialTheme({
      storageKey,
      id,
      themes,
      enableSystem,
      systemTheme,
      defaultTheme: defaultThemeRef.current,
      forcedTheme,
      initStorage: () => {
        if (!isForced && !shouldInherit) {
          const initialValue = enableSystem ? systemTheme : defaultTheme;
          saveThemeToStorage(storageKey, id, initialValue);
        }
      },
    });
    defaultThemeRef.current = initialTheme;
    return initialTheme;
  });

  // 系统主题监听
  useEffect(() => {
    if (!enableSystem) return;
    const cleanup = handleSystemThemeChange(setSystemTheme);
    return cleanup;
  }, [enableSystem]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // 只处理当前存储键的变化
      if (e.key !== storageKey) return;

      // 强制主题和继承组件不直接响应存储变化（由父组件处理）
      if (isForced || shouldInherit) {
        // 但继承组件需要通知父组件重新计算
        if (shouldInherit && parentContext) {
          parentContext.refreshTheme();
        }
        return;
      }

      try {
        // 存储键被完全删除
        if (e.newValue === null) {
          handleStorageCleared();
          return;
        }

        const newData = JSON.parse(e.newValue);
        const newTheme = newData[id];

        // 当前实例主题被删除
        if (!newTheme) {
          handleStorageCleared();
          return;
        }

        // 正常的主题更新
        if (newTheme !== theme && themes.includes(newTheme)) {
          setThemeState(newTheme);
        }
      } catch (err) {
        console.warn("存储同步失败:", err);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [storageKey, id, themes, isForced, shouldInherit, theme, parentContext]);

  const handleStorageCleared = () => {
    switch (cacheClearRecovery) {
      case "default":
        setThemeState(defaultThemeRef.current);
        break;
      case "none":
        // 保持当前主题
        break;
      case "system":
        if (enableSystem) {
          setThemeState(systemTheme);
        } else {
          setThemeState(defaultThemeRef.current);
        }
        break;
    }
  };

  // 系统主题或跟随状态变化时更新
  useEffect(() => {
    if (!isForced && enableSystem && !shouldInherit) {
      setThemeState(systemTheme);
    }
  }, [enableSystem, systemTheme, shouldInherit, isForced]);

  // 父主题变化时更新继承的主题
  useEffect(() => {
    if (!isForced && shouldInherit && parentContext) {
      setThemeState(parentContext.theme);
    }
  }, [shouldInherit, parentContext?.theme, isForced]);

  // 主题变化时应用到DOM并持久化
  useEffect(() => {
    if (!containerRef.current) return;
    applyThemeToElement({
      element: containerRef.current,
      theme,
      attribute,
      themes,
      enableColorScheme,
      systemTheme,
    });

    if (!isForced && !enableSystem) {
      if (shouldInherit && parentContext) {
        saveThemeToStorage(storageKey, parentContext.id, theme);
      } else if (!shouldInherit) {
        saveThemeToStorage(storageKey, id, theme);
      }
    }
  }, [
    theme,
    attribute,
    themes,
    enableSystem,
    id,
    systemTheme,
    shouldInherit,
    storageKey,
    isForced,
    parentContext,
  ]);

  // 刷新主题状态，同时通知子组件
  const refreshTheme = () => {
    if (isForced) return;
    const newTheme = getInitialTheme({
      storageKey,
      id,
      themes,
      systemTheme,
      enableSystem,
      defaultTheme,
      forcedTheme,
    });

    setThemeState(newTheme);
  };

  // 切换主题方法
  const setTheme = (newTheme: string) => {
    if (!isForced && themes.includes(newTheme)) {
      if (shouldInherit && parentContext) {
        parentContext.setTheme(newTheme);
      } else {
        setThemeState(newTheme);
      }
    }
  };

  // 切换跟随系统主题
  const setFollowSystemTheme = (follow: boolean) => {
    if (!isForced) {
      if (shouldInherit && parentContext) {
        parentContext.setFollowSystemTheme(follow);
      } else {
        if (follow) setThemeState(systemTheme);
      }
    }
  };

  // 清除主题设置
  const clearTheme = () => {
    if (!isForced) {
      try {
        if (shouldInherit && parentContext) {
          parentContext.clearTheme();
        } else {
          removeThemeFromStorage(storageKey, id);
          handleStorageCleared();
        }
      } catch (e) {
        console.warn("清除主题设置失败:", e);
      }
    }
  };

  // 清除所有主题设置（会影响整个存储键下的所有组件）
  const clearAllThemes = () => {
    if (!isForced) {
      clearAllThemesFromStorage(storageKey);
      handleStorageCleared();
    }
  };

  // 准备上下文值（暴露storageKey供子组件继承）
  const contextValue: ThemeContextValue = {
    theme,
    themes,
    systemTheme,
    enableSystem,
    id,
    themeScope,
    forcedTheme: isForced ? forcedTheme : undefined,
    enableColorScheme,
    cacheClearRecovery,
    defaultTheme: defaultThemeRef.current,
    storageKey,
    setTheme,
    setFollowSystemTheme,
    clearTheme,
    clearAllThemes,
    refreshTheme,
  };

  return (
    <ThemeContext value={contextValue}>
      <div ref={containerRef} className={cn(themeScope, className)}>
        {children}
      </div>
    </ThemeContext>
  );
};

export default ThemeProvider;

export const useTheme = () => {
  const context = use(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  const { theme, themes, setTheme } = context;
  return {
    theme,
    themes,
    setTheme,
  };
};

export const ThemeScript = ({
  storageKey = "app-themes",
  attribute = "data-theme",
  enableColorScheme = false,
  nonce,
  scriptProps,
}: Omit<ThemeProviderProps, "children">) => {
  const scriptContent = `
    (function() {
      try {
        const storageKey = ${storageKey};
        const attribute = ${attribute};
        const themeData = localStorage.getItem(storageKey);

        if (themeData) {
          const themes = JSON.parse(themeData);
          for (let id in themes) {
            const scope = 'theme-scope-' + id;
            const element = document.getElementsByClassName(scope)[0];
            if (element) {
              const themeValue = themes[id];
              const systemValue = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
              const resolvedTheme = themeValue === "system" ? systemValue : themeValue;
              if (attribute === 'class') {
                Object.values(themes).forEach(t => {
                  element.classList.remove(t);
                });
                element.classList.add(resolvedTheme);
              } else {
                const attrName = attribute.startsWith('data-') ? attribute : 'data-' + attribute;
                element.setAttribute(attrName, resolvedTheme);
              }
              if (${enableColorScheme}) {
                element.style.colorScheme = resolvedTheme;
              }
            }
          }
        }
      } catch (e) {}
    })();
  `;

  return (
    <script
      {...scriptProps}
      suppressHydrationWarning
      nonce={typeof window === "undefined" ? nonce : ""}
      // biome-ignore lint:security/noDangerouslySetInnerHtml
      dangerouslySetInnerHTML={{ __html: scriptContent }}
    />
  );
};
