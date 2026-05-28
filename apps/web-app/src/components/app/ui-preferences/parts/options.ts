import type {
	AppTheme,
	ContentWidthMode,
	DensityMode,
	FontScale,
	LayoutMode,
	RadiusMode,
} from "@/config/ui-preferences";
import type { AppHeaderFeatures } from "@/layouts/components/header";
import type { TabType } from "@/layouts/components/tabs/types";

export const themeOptions: { value: AppTheme; label: string }[] = [
	{ value: "light", label: "浅色" },
	{ value: "dark", label: "深色" },
	{ value: "system", label: "跟随系统" },
	{ value: "tech-blue", label: "科技蓝" },
	{ value: "eco-green", label: "生态绿" },
];

export const layoutOptions: { value: LayoutMode; label: string }[] = [
	{ value: "vertical", label: "垂直布局" },
	{ value: "horizontal", label: "水平布局" },
	{ value: "side", label: "侧边导航" },
	{ value: "double-column", label: "双列菜单" },
	{ value: "mix-vertical", label: "混合垂直" },
	{ value: "mix-double-column", label: "混合双列" },
	{ value: "fullscreen", label: "内容全屏" },
];

export const radiusOptions: { value: RadiusMode; label: string }[] = [
	{ value: "none", label: "无圆角" },
	{ value: "small", label: "小圆角" },
	{ value: "medium", label: "中圆角" },
	{ value: "large", label: "大圆角" },
];

export const fontScaleOptions: { value: FontScale; label: string }[] = [
	{ value: "normal", label: "标准" },
	{ value: "large", label: "大号" },
	{ value: "extra-large", label: "超大号" },
];

export const densityOptions: { value: DensityMode; label: string }[] = [
	{ value: "compact", label: "紧凑" },
	{ value: "normal", label: "标准" },
	{ value: "comfortable", label: "舒适" },
];

export const tabTypeOptions: { value: TabType; label: string }[] = [
	{ value: "chrome", label: "Chrome" },
	{ value: "classic", label: "经典" },
	{ value: "card", label: "卡片" },
	{ value: "vscode", label: "VS Code" },
	{ value: "trapezoid", label: "梯形" },
];

export const contentWidthOptions: { value: ContentWidthMode; label: string }[] = [
	{ value: "fluid", label: "流式" },
	{ value: "fixed", label: "定宽" },
];

export const headerFeatureOptions: { value: AppHeaderFeatures; label: string }[] = [
	{ value: "app-search", label: "搜索" },
	{ value: "theme-switch", label: "主题切换" },
	{ value: "i18n", label: "语言切换" },
	{ value: "fullscreen", label: "全屏" },
	{ value: "reload", label: "刷新" },
	{ value: "notify", label: "通知" },
	{ value: "user-center", label: "用户中心" },
	{ value: "ui-preferences", label: "偏好设置" },
];
