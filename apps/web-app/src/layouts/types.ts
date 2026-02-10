export type MenuOpenMode = "currentSystemTab" | "newSystemTab" | "iframe" | "newBrowserTab";
export type MenuType = "menu" | "dir" | "button";
export type MenuStatus = "enabled" | "disabled";
export type MenuBadgeType = "text" | "dot" | "badge";
export type MenuBadgeColor =
	| "default"
	| "primary"
	| "success"
	| "warning"
	| "destructive"
	| "custom";

export interface MenuBadge {
	type?: MenuBadgeType;
	text?: string;
	color?: MenuBadgeColor;
	customColor?: string;
}

export type MenuCategory = "application" | "system";

export interface MenuItem {
	id: string;
	code: string;
	title: string;
	url?: string;
	type: MenuType;
	icon?: string;
	parentId: string | null;
	parentCode: string | null;
	hidden: boolean;
	openMode?: MenuOpenMode;
	showHeader?: boolean;
	showSidebar?: boolean;
	showFooter?: boolean;
	keepAlive?: boolean;
	isOpenSidebar?: boolean;
	isHome?: boolean;
	isExternal?: boolean;
	badge?: MenuBadge;
	permissions: string | string[];
	order?: number;
	status: MenuStatus;
	children?: MenuItem[];
	category?: MenuCategory;
}

export interface FlatMenuItem extends MenuItem {
	level: number;
	path: string[];
}
