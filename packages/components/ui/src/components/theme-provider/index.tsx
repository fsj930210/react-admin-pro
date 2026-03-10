"use client";
import type React from "react";
import { 
	createContext, 
	createElement,
	use, 
	useContext, 
	useEffect, 
	useEffectEvent,
	useRef, 
	useState 
} from "react";
import type {  ThemeContextValue, ThemeProviderProps } from "./types";
import {
  applyThemeToElement,
  getSystemTheme,
	saveToStorage,
} from "./utils";


const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const usedStorageKeys = new Set<string>();
const MEDIA = '(prefers-color-scheme: dark)';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  storageKey,
  themes = ["light", "dark"],
  enableSystem = false,
  enableColorScheme = false,
  isIsolated = false,
  attributes = "class",
  defaultTheme = "light",
	asChild = isIsolated ? 'div' : 'html',
  forcedTheme,
	className,
}) => {
  const parentContext = useContext(ThemeContext);
  const containerRef = useRef<HTMLElement | null>(null);

  // 校验逻辑
  if (!parentContext && !isIsolated && !storageKey) {
    throw new Error("⚠️ 根组件（无父组件且非隔离）必须提供storageKey！");
  }
  if (isIsolated && !storageKey) {
    throw new Error("⚠️ 隔离组件必须提供storageKey！");
  }
  if (forcedTheme && forcedTheme !== 'system' && !storageKey) {
    throw new Error("⚠️ 强制主题组件必须提供storageKey！");
  }

  // 有父组件且非隔离 - 只做传递，不做其他逻辑
  // 但强制主题是独立控制的，即使isIsolated为false
  if (!isIsolated && parentContext && !forcedTheme) {
    const contextValue: ThemeContextValue = {
      theme: parentContext.theme,
      resolvedTheme: parentContext.resolvedTheme,
      forcedTheme: parentContext.forcedTheme,
      themes: parentContext.themes,
      systemTheme: parentContext.systemTheme,
      setTheme: parentContext.setTheme,
    };
    return (
      <ThemeContext value={contextValue}>
        {children}
      </ThemeContext>
    );
  }

  // 根组件、隔离组件、强制主题组件
	const [localTheme, setLocalTheme] = useState<string>(() => {
		if (forcedTheme && forcedTheme !== 'system') {
			saveToStorage(storageKey!, forcedTheme);
			return forcedTheme;
		}
		if (storageKey) {
			const theme = localStorage.getItem(storageKey);
			if (theme && themes.includes(theme)) {
				return theme;
			}
		}
		const fallback = themes.includes(defaultTheme) ? defaultTheme : themes[0];
		if (storageKey) {
			saveToStorage(storageKey, fallback);
		}
		return fallback;
	});
	const [resolvedTheme, setResolvedTheme] = useState<string>(() => localTheme === 'system' ? getSystemTheme() : localTheme);

  const handleMediaQuery = useEffectEvent((e: MediaQueryListEvent | MediaQueryList) => {
		const resolved = getSystemTheme(e);
		setResolvedTheme(resolved);
		if (localTheme === 'system' && enableSystem && !forcedTheme) {
			applyThemeToElement({
				element: isIsolated ? containerRef.current! : document.documentElement,
				theme: resolved,
				attributes,
				themes,
				enableColorScheme,
				defaultTheme,
			})
		}
	});

  const handleStorageChange = (e: StorageEvent) => {
		if (e.key !== storageKey) return;

		// If default theme set, use it if localstorage === null (happens on local storage manual deletion)
		if (!e.newValue) {
			setTheme(defaultTheme)
		} else {
			setLocalTheme(e.newValue) // Direct state update to avoid loops
		}
	};

  const setTheme = (theme: string | ((prevTheme: string) => string)) => {
		function handleSetTheme (newTheme: string) {
			if (forcedTheme) return;
			setLocalTheme(newTheme);
			setResolvedTheme(newTheme === 'system' ? getSystemTheme() : newTheme);
			if (storageKey) {
				saveToStorage(storageKey, newTheme);
			}
		}
		if (typeof theme === 'function') {
			const newTheme = theme(localTheme);
			handleSetTheme(newTheme);
		} else {
			handleSetTheme(theme);
		}
	};

	useEffect(() => {
		if (isIsolated && storageKey) {
			if (usedStorageKeys.has(storageKey)) {
				throw new Error(`⚠️ 重复的缓存Key: ${storageKey}，多个独立组件使用相同Key会导致缓存覆盖！`);
			} else {
				usedStorageKeys.add(storageKey);
			}
		}
    const media = window.matchMedia(MEDIA)
    media.addEventListener('change', handleMediaQuery)
    handleMediaQuery(media)
		window.addEventListener('storage', handleStorageChange)
    return () => {
			usedStorageKeys.delete(storageKey || '');
			window.removeEventListener('storage', handleStorageChange)
			media.removeEventListener('change', handleMediaQuery)
		}
  }, []);

	useEffect(() => {
		const el = asChild === 'html' ? document.documentElement : containerRef.current!;
		applyThemeToElement({
			element: el,
			theme: forcedTheme ?? localTheme,
			attributes,
			themes,
			enableColorScheme,
			defaultTheme,
		})
	}, [forcedTheme, localTheme]);

  const contextValue: ThemeContextValue = {
    theme: localTheme,
		resolvedTheme,
    forcedTheme,
		themes: enableSystem ? [...themes, 'system'] : themes,
    systemTheme: (enableSystem ? getSystemTheme() : undefined) as 'light' | 'dark' | undefined,
    setTheme,
  };
  const slot = asChild === 'html' ? 'div' : asChild;
  return (
    <ThemeContext value={contextValue}>
			{
				asChild === 'html' ? children : createElement(slot, {
					ref: containerRef,
					className,
					id: storageKey,
				}, children)
			}
    </ThemeContext>
  );
};

export const useTheme = () => {
  const context = use(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  const { theme, themes, setTheme, resolvedTheme, systemTheme, forcedTheme } = context;
  return {
    theme,
    themes,
		systemTheme,
		resolvedTheme,
		forcedTheme,
    setTheme,
  };
};
