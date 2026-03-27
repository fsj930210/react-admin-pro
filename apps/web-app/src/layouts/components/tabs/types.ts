import type { RefAttributes } from "react";
import type { MenuItem } from "@/layouts/types";
export type TabType = "chrome" | "vscode" | "classic" | "card" | "trapezoid";
export interface AppTabItem extends MenuItem {
	pinned?: boolean;
	closable?: boolean;
	disabled?: boolean;
}

export type AppTabItemProps = {
	tab: AppTabItem;
	active: boolean;
	index: number;
	onClose?: (tabItem: AppTabItem) => void;
	onPin?: (tabItem: AppTabItem) => void;
	onReload?: (tabItem: AppTabItem) => void;
	onOpenInNewTab?: (tabItem: AppTabItem) => void;
	onMaximize?: (tabItem: AppTabItem) => void;
	onItemClick?: (tabItem: AppTabItem) => void;
} & RefAttributes<HTMLDivElement>;

export type TabsContextMenuAction =
	| "close"
	| "pin"
	| "closeLeft"
	| "closeRight"
	| "closeOthers"
	| "reload"
	| "openInNewTab"
	| "maximize";
