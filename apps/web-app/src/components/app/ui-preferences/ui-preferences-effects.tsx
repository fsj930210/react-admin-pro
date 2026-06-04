import { useTheme } from "@rap/components-ui/theme-provider";
import { useEffect } from "react";
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
  compact: "0.875",
  normal: "1",
  comfortable: "1.125",
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
  }, [preferences]);

  useEffect(() => {
    if (!preferences.app.dynamicTitle) return;
    document.title = preferences.app.titleTemplate.replace("%s", preferences.app.name);
  }, [preferences.app.dynamicTitle, preferences.app.name, preferences.app.titleTemplate]);

  return null;
}
