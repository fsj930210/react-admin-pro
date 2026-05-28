import type React from "react";

type DataAttribute = `data-${string}`;

export type ThemeAttribute = DataAttribute | "class";
export type ThemeScope = "root" | "local" | "inherit";
export type ColorScheme = "light" | "dark";

export interface ThemeContextValue {
	theme: string;
	themes: string[];
	resolvedTheme: string;
	forcedTheme?: string;
	systemTheme?: ColorScheme;
	setTheme: (theme: string | ((prevTheme: string) => string)) => void;
}

export interface ThemeProviderProps {
	children: React.ReactNode;
	scope?: ThemeScope;
	storageKey?: string;
	themes?: string[];
	enableSystem?: boolean;
	enableColorScheme?: boolean;
	attribute?: ThemeAttribute;
	defaultTheme?: string;
	forcedTheme?: string;
	className?: string;
	as?: keyof HTMLElementTagNameMap;
	colorSchemeMap?: Record<string, ColorScheme>;
}
