import type { RefAttributes } from "react";
export type TabType = "chrome" | "vscode" | "classic" | "card" | "trapezoid";
export type LayoutTabItem = {
  title: string;
  key: string;
  pinned?: boolean;
  closable?: boolean;
  disabled?: boolean;
  icon?: string;
};

export type UpdateTabsFunc = (
  fn: (oldTabs: LayoutTabItem[]) => LayoutTabItem[]
) => void;
export type LayoutTabItemProps = {
  tab: LayoutTabItem;
  active: boolean;
  onClose?: (value: string) => void;
  onPin?: (value: string) => void;
  onReload?: (value: string) => void;
  onOpenInNewTab?: (value: string) => void;
  onMaximize?: (value: string) => void;
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
