import type { ColorScheme, ThemeAttribute } from "./types";

export const MEDIA = "(prefers-color-scheme: dark)";
export const colorSchemes = ["light", "dark"] satisfies ColorScheme[];

export const getSystemTheme = (media?: MediaQueryListEvent | MediaQueryList): ColorScheme => {
  if (!media && typeof window === "undefined") {
    return "light";
  }
  const query = media ?? window.matchMedia(MEDIA);
  return query.matches ? "dark" : "light";
};

export const getStoredTheme = (storageKey: string) => {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    return localStorage.getItem(storageKey) || undefined;
  } catch {
    return;
  }
};

export const saveToStorage = (storageKey: string, value: string) => {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(storageKey, value);
  } catch {
    return;
  }
};

export const applyThemeToElement = ({
  element,
  theme,
  attribute,
  themes,
  enableColorScheme,
  colorSchemeMap,
}: {
  element: HTMLElement;
  theme: string;
  attribute: ThemeAttribute;
  themes: string[];
  enableColorScheme: boolean;
  colorSchemeMap: Record<string, ColorScheme>;
}) => {
  if (attribute === "class") {
    for (const item of themes) {
      element.classList.remove(item);
    }
    element.classList.add(theme);
  } else {
    element.setAttribute(attribute, theme);
  }

  if (enableColorScheme) {
    const colorScheme = colorSchemeMap[theme];
    if (colorScheme) {
      element.style.colorScheme = colorScheme;
    } else {
      element.style.removeProperty("color-scheme");
    }
  }
};
