import { createStore } from "@rap/hooks/use-zustand";

interface LayoutConfigState {
  showTabs: boolean;
  layoutType: "vertical" | "horizontal";
}
interface AppearanceConfigState {
  appTheme: "light" | "dark" | "tech-blue" | "eco-green" | "system";
  primaryColor: string;
}
interface CommonConfigState {
  appLanguage: string;
}
interface AppConfigState {
  layoutConfig: LayoutConfigState;
  appearanceConfig: AppearanceConfigState;
  commonConfig: CommonConfigState;
  count: number;
}

const appConfigStore = createStore<AppConfigState>(
  () => ({
    layoutConfig: {
      showTabs: true,
      layoutType: "vertical",
    },
    appearanceConfig: {
      appTheme: "light",
      primaryColor: "#007bff",
    },
    commonConfig: {
      appLanguage: "zhCN",
    },
    count: 0,
  }),
  {
    name: "AppConfigStore",
  }
);

const useAppConfig = appConfigStore.use;

export { appConfigStore, useAppConfig };
