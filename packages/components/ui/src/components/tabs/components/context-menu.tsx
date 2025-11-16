import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@rap/components-base/context-menu";
import { ExternalLink, Maximize2, Pin, RefreshCw, X } from "lucide-react";
import type * as React from "react";
import { useTabsContextMenu } from "../hooks/use-tabs-context-menu";
import type { LayoutTabItem, UpdateTabsFunc } from "../types";

interface TabsContextMenuProps {
  tab: LayoutTabItem;
  tabs: LayoutTabItem[];
  children: React.ReactNode;
  activeTab: string;
  updateTabs: UpdateTabsFunc;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export function TabsContextMenu({
  tab,
  tabs,
  children,
  activeTab,
  updateTabs,
  setActiveTab,
}: TabsContextMenuProps) {
  // 使用自定义hook处理标签页上下文菜单逻辑
  const {
    handleCloseTab,
    handlePinTab,
    handleCloseLeftTabs,
    handleCloseRightTabs,
    handleCloseOtherTabs,
    handleReloadTab,
    handleOpenInNewTab,
    handleMaximize,
  } = useTabsContextMenu({
    updateTabs,
    setActiveTab,
    activeTab,
  });

  // 查找当前tab在数组中的索引
  const currentIndex = tabs.findIndex((t) => t.key === tab.key);

  // 检查是否有左侧/右侧的tab可以关闭
  const hasTabsToLeft = currentIndex > 0;
  const hasTabsToRight = currentIndex < tabs.length - 1;
  const hasOtherTabs = tabs.length > 1;

  // 检查当前标签页是否为激活状态
  const isActiveTab = activeTab === tab.key;

  // 检查是否可以关闭（只有激活的标签页才能使用关闭左侧/右侧/其他功能）
  const canUseCloseActions = isActiveTab;
  const canCloseCurrent = tab.closable !== false;

  return (
    <ContextMenu>
      <ContextMenuTrigger className="size-full">{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* 关闭当前标签页 */}
        <ContextMenuItem
          onClick={() => handleCloseTab(tab.key)}
          className="flex items-center gap-2"
          disabled={!canCloseCurrent}
        >
          <X className="size-4" />
          <span>关闭当前页</span>
        </ContextMenuItem>

        {/* 固定/取消固定标签页 */}
        <ContextMenuItem
          onClick={() => handlePinTab(tab.key)}
          className="flex items-center gap-2"
        >
          <Pin className="size-4" />
          <span>{tab.pinned ? "取消固定" : "固定"}</span>
        </ContextMenuItem>

        {/* 分隔线 */}
        <ContextMenuSeparator />

        {/* 关闭左侧标签页 */}
        <ContextMenuItem
          onClick={() => handleCloseLeftTabs(tab.key)}
          className="flex items-center gap-2"
          disabled={!canUseCloseActions || !hasTabsToLeft}
        >
          <X className="size-4" />
          <span>关闭左侧</span>
        </ContextMenuItem>

        {/* 关闭右侧标签页 */}
        <ContextMenuItem
          onClick={() => handleCloseRightTabs(tab.key)}
          className="flex items-center gap-2"
          disabled={!canUseCloseActions || !hasTabsToRight}
        >
          <X className="size-4" />
          <span>关闭右侧</span>
        </ContextMenuItem>

        {/* 关闭其他标签页 */}
        <ContextMenuItem
          onClick={() => handleCloseOtherTabs(tab.key)}
          className="flex items-center gap-2"
          disabled={!canUseCloseActions || !hasOtherTabs}
        >
          <X className="size-4" />
          <span>关闭其他</span>
        </ContextMenuItem>

        {/* 分隔线 */}
        <ContextMenuSeparator />

        {/* 重新加载 - 只有激活的标签页才能重新加载 */}
        <ContextMenuItem
          onClick={() => handleReloadTab(tab.key)}
          className="flex items-center gap-2"
          disabled={!isActiveTab}
        >
          <RefreshCw className="size-4" />
          <span>重新加载</span>
        </ContextMenuItem>

        {/* 最大化 */}
        <ContextMenuItem
          onClick={() => handleMaximize(tab.key)}
          className="flex items-center gap-2"
          disabled={!isActiveTab}
        >
          <Maximize2 className="size-4" />
          <span>最大化</span>
        </ContextMenuItem>

        {/* 在新标签页中打开 */}
        <ContextMenuItem
          onClick={() => handleOpenInNewTab(tab.key)}
          className="flex items-center gap-2"
        >
          <ExternalLink className="size-4" />
          <span>在新的浏览器标签打开</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
