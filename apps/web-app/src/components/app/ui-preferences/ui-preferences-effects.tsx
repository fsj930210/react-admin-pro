import { useTheme } from "@rap/components-ui/theme-provider";
import { useEffect } from "react";
import type { PrimaryColor } from "@/config/ui-preferences";
import { useUIPreferences } from "@/store/ui-preferences";

const radiusMap = {
  none: "0px",
  small: "0.25rem",
  medium: "0.625rem",
  large: "0.875rem",
};

const fontScaleMap = {
  normal: "14px",
  large: "16px",
  "extra-large": "18px",
};

const densityMap = {
  compact: "0.9",
  normal: "1.125",
  comfortable: "1.25",
};

const primaryColorMap: Partial<Record<PrimaryColor, string>> = {
  aurora: "#00b8a9",
  glacier: "#2f80ed",
  mint: "#20c997",
  lime: "#84cc16",
  amber: "#f59f00",
  coral: "#ff6b6b",
  ruby: "#e03131",
  orchid: "#ae3ec9",
  indigo: "#4c6ef5",
  graphite: "#495057",
  steel: "#42637a",
  sand: "#b08968",
  custom: "#2f80ed",
};

const hexToRgb = (hex: string) => {
  const normalizedHex = hex.trim().replace("#", "");
  if (!/^[\da-f]{6}$/i.test(normalizedHex)) return;

  return {
    r: Number.parseInt(normalizedHex.slice(0, 2), 16),
    g: Number.parseInt(normalizedHex.slice(2, 4), 16),
    b: Number.parseInt(normalizedHex.slice(4, 6), 16),
  };
};

const parseRgbColor = (color: string) => {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return;

  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
  };
};

const resolveCssColor = (color: string) => {
  if (typeof document === "undefined") return;

  const probe = document.createElement("span");
  probe.style.color = color;
  probe.style.position = "fixed";
  probe.style.pointerEvents = "none";
  probe.style.opacity = "0";
  document.body.append(probe);
  const resolvedColor = getComputedStyle(probe).color;
  probe.remove();
  return parseRgbColor(resolvedColor);
};

const getLuminance = (rgb: { r: number; g: number; b: number }) => {
  const normalize = (value: number) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * normalize(rgb.r) + 0.7152 * normalize(rgb.g) + 0.0722 * normalize(rgb.b);
};

const getContrastRatio = (
  foreground: { r: number; g: number; b: number },
  background: { r: number; g: number; b: number }
) => {
  const foregroundLuminance = getLuminance(foreground);
  const backgroundLuminance = getLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

const getReadableForeground = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#ffffff";

  const luminance = getLuminance(rgb);
  return luminance > 0.68 ? "#111827" : "#ffffff";
};

const getSafePrimaryColor = (color: string, root: HTMLElement) => {
  const primaryRgb = hexToRgb(color);
  const backgroundRgb = resolveCssColor(getComputedStyle(root).getPropertyValue("--background"));
  if (!primaryRgb || !backgroundRgb) return color;

  if (getContrastRatio(primaryRgb, backgroundRgb) >= 2) {
    return color;
  }

  return getLuminance(backgroundRgb) > 0.5 ? "#111827" : "#f8fafc";
};

export function UIPreferencesEffects() {
  const preferences = useUIPreferences("preferences");
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    if (theme === preferences.appearance.theme) return;
    setTheme(preferences.appearance.theme);
  }, [preferences.appearance.theme, setTheme, theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("app-grayscale", preferences.appearance.grayscale);
    root.classList.toggle("app-reduced-motion", preferences.animation.reducedMotion);
    root.dataset.appDensity = preferences.appearance.density;
    root.style.setProperty("--radius", radiusMap[preferences.appearance.radius]);
    root.style.setProperty("--app-font-size", fontScaleMap[preferences.appearance.fontScale]);
    root.style.setProperty("--app-density-scale", densityMap[preferences.appearance.density]);
    root.style.setProperty("--app-header-height", `${preferences.layout.header.height}px`);
    root.style.setProperty("--app-footer-height", `${preferences.layout.footer.height}px`);
    root.style.setProperty("--app-content-padding", `${preferences.layout.contentPadding}px`);
    root.style.setProperty("--app-max-content-width", `${preferences.layout.maxContentWidth}px`);
    root.style.setProperty(
      "--sidebar-width-icon",
      `${preferences.layout.sidebar.collapsedWidth}px`
    );
    root.style.removeProperty("--scrollbar-thumb");
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-foreground");
    root.style.removeProperty("--sidebar-accent");
    root.style.removeProperty("--sidebar-accent-foreground");

    if (
      preferences.appearance.primaryColor === "theme" ||
      preferences.appearance.primaryColor === "default"
    ) {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-foreground");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--sidebar-primary");
      root.style.removeProperty("--sidebar-primary-foreground");
      root.style.removeProperty("--sidebar-ring");
      root.style.removeProperty("--chart-1");
      root.style.removeProperty("--table-filter-active");
      return;
    }

    const primaryColor =
      preferences.appearance.primaryColor === "custom"
        ? preferences.appearance.customPrimaryColor
        : primaryColorMap[preferences.appearance.primaryColor] ||
          primaryColorMap.custom ||
          "#2f80ed";
    const safePrimaryColor = getSafePrimaryColor(primaryColor, root);
    const primaryForeground = getReadableForeground(safePrimaryColor);

    root.style.setProperty("--primary", safePrimaryColor);
    root.style.setProperty("--primary-foreground", primaryForeground);
    root.style.setProperty("--ring", safePrimaryColor);
    root.style.setProperty("--sidebar-primary", safePrimaryColor);
    root.style.setProperty("--sidebar-primary-foreground", primaryForeground);
    root.style.setProperty("--sidebar-ring", safePrimaryColor);
    root.style.setProperty("--chart-1", safePrimaryColor);
    root.style.setProperty("--table-filter-active", safePrimaryColor);
  }, [preferences]);

  useEffect(() => {
    if (!preferences.app.dynamicTitle) return;
    document.title = preferences.app.titleTemplate.replace("%s", preferences.app.name);
  }, [preferences.app.dynamicTitle, preferences.app.name, preferences.app.titleTemplate]);

  return null;
}
