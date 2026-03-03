import type { Attributes } from "./types";

export const colorSchemes = ['light', 'dark'];
export const getTheme = ({
  storageKey,
  themes,
  defaultTheme,
  forcedTheme,
}: {
  storageKey: string;
  themes: string[];
  defaultTheme: string;
  forcedTheme?: string;
	isIsolated?: boolean;
}) => {
  if (forcedTheme && themes.includes(forcedTheme)) {
    return forcedTheme;
  }
	const fallback = themes.includes(defaultTheme) ? defaultTheme : themes[0];
	let theme;
  try {
    theme = localStorage.getItem(storageKey) || undefined
  } catch (e) {
    console.log(e)
  }
  return theme || fallback
};

export const getSystemTheme = (e?: MediaQueryListEvent | MediaQueryList) => {
	const media = e || window.matchMedia('(prefers-color-scheme: dark)');
  if (media && media.matches) {
    return "dark";
  }
  return "light";
};


export const applyThemeToElement = ({
  element,
  theme,
  attributes,
  themes,
  enableColorScheme,
	defaultTheme,
}: {
  element: HTMLElement;
  theme: string;
  attributes: Attributes;
  themes: string[];
  enableColorScheme: boolean;
	defaultTheme: string;
}) => {
	const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
	const attrs = Array.isArray(attributes) ? attributes : [attributes];
	attrs.forEach((attr) => {
    if (attr === "class") {
      themes.forEach((t) => {
        element.classList.remove(t);
      });
      element.classList.add(resolvedTheme);
    } else {
      const attrName = attr.startsWith("data-")
        ? attr
        : `data-${attr}`;
      element.setAttribute(attrName, resolvedTheme);
    }
  });
  if (enableColorScheme) {
		const fallback = colorSchemes.includes(defaultTheme) ? defaultTheme : ''
    const colorScheme = colorSchemes.includes(resolvedTheme) ? resolvedTheme : fallback
    colorScheme && (element.style.colorScheme = colorScheme)
  }
};

export const saveToStorage = (storageKey: string, value: string) => {
  try {
    localStorage.setItem(storageKey, value)
  } catch (e) {
    console.log(e)
  }
}
