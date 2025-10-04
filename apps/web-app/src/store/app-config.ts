import { createSetter, createStore, type SetterFunction } from "@rap/hooks/use-zustand";

interface LayoutConfigState {
	showTabs: boolean;
	layoutType: "vertical" | "horizontal";
}
interface AppearanceConfigState {
	appTheme: "light" | "dark" | "system";
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

interface AppConfigActions {
	setLayoutConfig: SetterFunction<AppConfigState, "layoutConfig">;
	setAppearanceConfig: SetterFunction<AppConfigState, "appearanceConfig">;
	setCommonConfig: SetterFunction<AppConfigState, "commonConfig">;
	setCount: SetterFunction<AppConfigState, "count">;
}

type AppConfigStore = AppConfigState & AppConfigActions;

const { selector: useAppConfigSelector } = createStore<AppConfigStore>(
	(set) => ({
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
		setLayoutConfig: createSetter<AppConfigState, "layoutConfig">(set, "layoutConfig"),
		setAppearanceConfig: createSetter<AppConfigState, "appearanceConfig">(set, "appearanceConfig"),
		setCommonConfig: createSetter<AppConfigState, "commonConfig">(set, "commonConfig"),
		setCount: createSetter<AppConfigState, "count">(set, "count"),
	}),
	{
		name: "AppConfigStore",
	},
);
export { useAppConfigSelector };
