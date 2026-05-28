"use client";

import type React from "react";
import {
	createContext,
	createElement,
	use,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type {
	ColorScheme,
	ThemeContextValue,
	ThemeProviderProps,
} from "./types";
import {
	applyThemeToElement,
	colorSchemes,
	getStoredTheme,
	getSystemTheme,
	MEDIA,
	saveToStorage,
} from "./utils";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getFallbackTheme = (themes: string[], defaultTheme: string) => {
	return themes.includes(defaultTheme) || defaultTheme === "system"
		? defaultTheme
		: themes[0];
};

const getResolvedTheme = ({
	theme,
	forcedTheme,
	systemTheme,
}: {
	theme: string;
	forcedTheme?: string;
	systemTheme: ColorScheme;
}) => {
	if (forcedTheme) return forcedTheme;
	return theme === "system" ? systemTheme : theme;
};

type ActiveThemeProviderProps = ThemeProviderProps & {
	scope: Exclude<NonNullable<ThemeProviderProps["scope"]>, "inherit">;
};

const ActiveThemeProvider: React.FC<ActiveThemeProviderProps> = ({
	children,
	scope,
	storageKey,
	themes = ["light", "dark"],
	enableSystem = false,
	enableColorScheme = false,
	attribute = "class",
	defaultTheme = "light",
	forcedTheme,
	className,
	as = "div",
	colorSchemeMap,
}) => {
	const parentContext = useContext(ThemeContext);
	const containerRef = useRef<HTMLElement | null>(null);
	const appliedThemeRef = useRef<string | undefined>(undefined);

	if (scope === "root" && parentContext) {
		throw new Error("ThemeProvider scope='root' cannot be nested.");
	}

	if (scope === "root" && !storageKey && !forcedTheme) {
		throw new Error(
			"ThemeProvider scope='root' requires storageKey unless forcedTheme is provided.",
		);
	}

	const availableThemes = useMemo(() => {
		return enableSystem ? [...themes, "system"] : themes;
	}, [enableSystem, themes]);

	const resolvedColorSchemeMap = useMemo<Record<string, ColorScheme>>(() => {
		return {
			...Object.fromEntries(colorSchemes.map((item) => [item, item])),
			...colorSchemeMap,
		};
	}, [colorSchemeMap]);

	const [systemTheme, setSystemTheme] = useState<ColorScheme>(() =>
		getSystemTheme(),
	);
	const [theme, setThemeState] = useState<string>(() => {
		if (forcedTheme) return forcedTheme;

		if (storageKey) {
			const storedTheme = getStoredTheme(storageKey);
			if (storedTheme && availableThemes.includes(storedTheme)) {
				return storedTheme;
			}
		}

		const fallback = getFallbackTheme(availableThemes, defaultTheme);
		if (fallback === "system" && !enableSystem) {
			return themes[0];
		}
		return fallback;
	});

	const resolvedTheme = getResolvedTheme({
		theme,
		forcedTheme,
		systemTheme,
	});

	const setTheme = useCallback<ThemeContextValue["setTheme"]>(
		(value) => {
			if (forcedTheme) return;

			setThemeState((prevTheme) => {
				const nextTheme =
					typeof value === "function" ? value(prevTheme) : value;
				if (!availableThemes.includes(nextTheme)) return prevTheme;
				if (storageKey) {
					saveToStorage(storageKey, nextTheme);
				}
				return nextTheme;
			});
		},
		[availableThemes, forcedTheme, storageKey],
	);

	useEffect(() => {
		if (forcedTheme) {
			setThemeState(forcedTheme);
		}
	}, [forcedTheme]);

	useEffect(() => {
		if (!enableSystem) return;

		const media = window.matchMedia(MEDIA);
		const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
			setSystemTheme(getSystemTheme(event));
		};

		handleChange(media);
		media.addEventListener("change", handleChange);
		return () => media.removeEventListener("change", handleChange);
	}, [enableSystem]);

	useEffect(() => {
		if (!storageKey || forcedTheme) return;

		const handleStorageChange = (event: StorageEvent) => {
			if (event.key !== storageKey) return;

			const nextTheme = event.newValue;
			if (nextTheme && availableThemes.includes(nextTheme)) {
				setThemeState(nextTheme);
			} else {
				setThemeState(getFallbackTheme(availableThemes, defaultTheme));
			}
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, [availableThemes, defaultTheme, forcedTheme, storageKey]);

	useEffect(() => {
		const element =
			scope === "root" ? document.documentElement : containerRef.current;
		if (!element) return;

		if (
			attribute === "class" &&
			appliedThemeRef.current &&
			!themes.includes(appliedThemeRef.current)
		) {
			element.classList.remove(appliedThemeRef.current);
		}

		applyThemeToElement({
			element,
			theme: resolvedTheme,
			attribute,
			themes,
			enableColorScheme,
			colorSchemeMap: resolvedColorSchemeMap,
		});
		appliedThemeRef.current = resolvedTheme;
	}, [
		attribute,
		enableColorScheme,
		resolvedColorSchemeMap,
		resolvedTheme,
		scope,
		themes,
	]);

	const contextValue = useMemo<ThemeContextValue>(
		() => ({
			theme,
			resolvedTheme,
			forcedTheme,
			themes: availableThemes,
			systemTheme: enableSystem ? systemTheme : undefined,
			setTheme,
		}),
		[
			availableThemes,
			enableSystem,
			forcedTheme,
			resolvedTheme,
			setTheme,
			systemTheme,
			theme,
		],
	);

	return (
		<ThemeContext value={contextValue}>
			{scope === "root"
				? children
				: createElement(
						as,
						{
							ref: containerRef,
							className,
							"data-theme-scope": storageKey,
						},
						children,
					)}
		</ThemeContext>
	);
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
	scope = "root",
	children,
	forcedTheme,
	...props
}) => {
	const parentContext = useContext(ThemeContext);

	if (scope === "inherit") {
		if (!parentContext) {
			throw new Error("ThemeProvider scope='inherit' requires a parent provider.");
		}
		if (forcedTheme) {
			throw new Error("ThemeProvider scope='inherit' cannot use forcedTheme.");
		}

		return <ThemeContext value={parentContext}>{children}</ThemeContext>;
	}

	return (
		<ActiveThemeProvider scope={scope} forcedTheme={forcedTheme} {...props}>
			{children}
		</ActiveThemeProvider>
	);
};

export const useTheme = () => {
	const context = use(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
};
