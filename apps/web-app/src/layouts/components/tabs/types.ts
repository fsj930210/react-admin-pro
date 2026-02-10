import type { RefAttributes } from "react";
import type { MenuItem } from "@/layouts/types";
export type TabType = "chrome" | "vscode" | "classic" | "card" | "trapezoid";
export interface LayoutTabItem extends MenuItem {
	pinned?: boolean;
	closable?: boolean;
	disabled?: boolean;
}

export type LayoutTabItemProps = {
	tab: LayoutTabItem;
	active: boolean;
	index: number;
	onClose?: (value: string) => void;
	onPin?: (value: string) => void;
	onReload?: (value: string) => void;
	onOpenInNewTab?: (value: string) => void;
	onMaximize?: (value: string) => void;
	onItemClick?: (tabItem: LayoutTabItem) => void;
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
