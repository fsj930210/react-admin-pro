import type { AppHeaderFeatures } from "@/layouts/components/header";
import type { TabType } from "@/layouts/components/tabs/types";

export type AppTheme = "light" | "dark" | "tech-blue" | "eco-green" | "system";
export type LayoutMode =
	| "horizontal"
	| "vertical"
	| "double-column"
	| "side"
	| "mix-vertical"
	| "mix-double-column"
	| "fullscreen";
export type RadiusMode = "none" | "small" | "medium" | "large";
export type FontScale = "normal" | "large" | "extra-large";
export type DensityMode = "compact" | "normal" | "comfortable";
export type ContentWidthMode = "fluid" | "fixed";

export interface UIPreferences {
	app: {
		name: string;
		shortName: string;
		titleTemplate: string;
		dynamicTitle: boolean;
	};
	appearance: {
		theme: AppTheme;
		availableThemes: AppTheme[];
		followSystem: boolean;
		grayscale: boolean;
		radius: RadiusMode;
		fontScale: FontScale;
		density: DensityMode;
	};
	layout: {
		mode: LayoutMode;
		contentWidth: ContentWidthMode;
		contentPadding: number;
		maxContentWidth: number;
		sidebar: {
			defaultCollapsed: boolean;
			collapsible: boolean;
			resizable: boolean;
			width: number;
			minWidth: number;
			maxWidth: number;
			collapsedWidth: number;
			showTrigger: boolean;
		};
		header: {
			defaultCollapsed: boolean;
			collapsible: boolean;
			height: number;
			sticky: boolean;
			leftFeatures: AppHeaderFeatures[];
			rightFeatures: AppHeaderFeatures[];
		};
		footer: {
			enabled: boolean;
			height: number;
			text: string;
		};
	};
	tabs: {
		enabled: boolean;
		type: TabType;
		sortable: boolean;
		showRefresh: boolean;
		showMaximize: boolean;
		showContextMenu: boolean;
	};
	animation: {
		progress: boolean;
		pageLoading: boolean;
		pageTransition: boolean;
		reducedMotion: boolean;
	};
	i18n: {
		defaultLanguage: string;
		languages: string[];
		showSwitcher: boolean;
		timezone: string;
	};
	templatePreview: {
		enabled: boolean;
		persist: boolean;
		storageKey: string;
		panelOpen: boolean;
	};
}

export type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export const DEFAULT_UI_PREFERENCES: UIPreferences = {
	app: {
		name: "React Admin Pro",
		shortName: "RAP",
		titleTemplate: "%s - React Admin Pro",
		dynamicTitle: true,
	},
	appearance: {
		theme: "dark",
		availableThemes: ["light", "dark", "tech-blue", "eco-green", "system"],
		followSystem: true,
		grayscale: false,
		radius: "medium",
		fontScale: "normal",
		density: "normal",
	},
	layout: {
		mode: "vertical",
		contentWidth: "fluid",
		contentPadding: 0,
		maxContentWidth: 1280,
		sidebar: {
			defaultCollapsed: false,
			collapsible: true,
			resizable: true,
			width: 256,
			minWidth: 224,
			maxWidth: 352,
			collapsedWidth: 48,
			showTrigger: true,
		},
		header: {
			defaultCollapsed: false,
			collapsible: true,
			height: 44,
			sticky: true,
			leftFeatures: ["breadcrumb"],
			rightFeatures: [
				"app-search",
				"theme-switch",
				"i18n",
				"fullscreen",
				"reload",
				"notify",
				"ui-preferences",
				"user-center",
			],
		},
		footer: {
			enabled: true,
			height: 56,
			text: "React Admin Pro",
		},
	},
	tabs: {
		enabled: true,
		type: "chrome",
		sortable: true,
		showRefresh: true,
		showMaximize: true,
		showContextMenu: true,
	},
	animation: {
		progress: true,
		pageLoading: true,
		pageTransition: true,
		reducedMotion: false,
	},
	i18n: {
		defaultLanguage: "zhCN",
		languages: ["zhCN", "enUS"],
		showSwitcher: true,
		timezone: "Asia/Shanghai",
	},
	templatePreview: {
		enabled: true,
		persist: false,
		storageKey: "rap-ui-preferences-preview",
		panelOpen: false,
	},
};

export const PROJECT_UI_PREFERENCES: DeepPartial<UIPreferences> = {};
