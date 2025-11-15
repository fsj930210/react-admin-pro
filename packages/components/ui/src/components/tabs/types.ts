export type LayoutTabItem = {
  label: string;
  value: string;
  fixed?: boolean;
  reloadable?: boolean;
  openInNewTab?: boolean;
  maximizable?: boolean;
  url?: string;
};

import type { RefAttributes } from 'react';

export type LayoutTabsProps = {
  /** 是否启用标签页拖拽排序 */
  sortable?: boolean;
};

export type LayoutTabItemProps = {
  tab: LayoutTabItem;
  active: boolean;
  onClick: (value: string) => void;
  onClose?: (value: string) => void;
  onPin?: (value: string) => void;
  onReload?: (value: string) => void;
  onOpenInNewTab?: (value: string) => void;
  onMaximize?: (value: string) => void;
} & RefAttributes<HTMLDivElement>;

export type TabsContextMenuAction =
  | 'close'
  | 'pin'
  | 'closeLeft'
  | 'closeRight'
  | 'closeOthers'
  | 'reload'
  | 'openInNewTab'
  | 'maximize';