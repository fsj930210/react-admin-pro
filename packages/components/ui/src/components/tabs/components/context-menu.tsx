import * as React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@rap/components-base/context-menu';
import type { LayoutTabItem } from '../types';
import { X, Pin, RefreshCw, ExternalLink, Maximize2 } from 'lucide-react';

interface TabsContextMenuProps {
  tab: LayoutTabItem;
  tabs: LayoutTabItem[];
  selectedTab: string;
  onClose?: (value: string) => void;
  onPin?: (value: string) => void;
  onReload?: (value: string) => void;
  onOpenInNewTab?: (value: string) => void;
  onMaximize?: (value: string) => void;
  onCloseLeft?: (value: string) => void;
  onCloseRight?: (value: string) => void;
  onCloseOthers?: (value: string) => void;
  children: React.ReactNode;
}

export function TabsContextMenu({ 
  tab, 
  onClose, 
  onPin, 
  onReload, 
  onOpenInNewTab,
  onMaximize,
  tabs,
  // selectedTab,
  onCloseLeft,
  onCloseRight,
  onCloseOthers,
  children
}: TabsContextMenuProps) {
  // 查找当前tab在数组中的索引
  const currentIndex = tabs.findIndex(t => t.value === tab.value);
  
  // 检查是否有左侧/右侧的tab可以关闭
  const hasTabsToLeft = currentIndex > 0;
  const hasTabsToRight = currentIndex < tabs.length - 1;
  const hasOtherTabs = tabs.length > 1;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* 关闭当前标签页 */}
        {onClose && (
          <ContextMenuItem
            onClick={() => onClose(tab.value)}
            className="flex items-center gap-2"
          >
            <X className="size-4" />
            <span>关闭当前页</span>
          </ContextMenuItem>
        )}
        
        {/* 固定/取消固定标签页 */}
        {onPin && (
          <ContextMenuItem
            onClick={() => onPin(tab.value)}
            className="flex items-center gap-2"
          >
            <Pin className="size-4" />
            <span>{tab.fixed ? '取消固定' : '固定'}</span>
          </ContextMenuItem>
        )}
        
        {/* 分隔线 */}
        <ContextMenuSeparator />
        
        {/* 关闭左侧标签页 */}
        {onCloseLeft && hasTabsToLeft && (
          <ContextMenuItem
            onClick={() => onCloseLeft(tab.value)}
            className="flex items-center gap-2"
          >
            <X className="size-4" />
            <span>关闭左侧</span>
          </ContextMenuItem>
        )}
        
        {/* 关闭右侧标签页 */}
        {onCloseRight && hasTabsToRight && (
          <ContextMenuItem
            onClick={() => onCloseRight(tab.value)}
            className="flex items-center gap-2"
          >
            <X className="size-4" />
            <span>关闭右侧</span>
          </ContextMenuItem>
        )}
        
        {/* 关闭其他标签页 */}
        {onCloseOthers && hasOtherTabs && (
          <ContextMenuItem
            onClick={() => onCloseOthers(tab.value)}
            className="flex items-center gap-2"
          >
            <X className="size-4" />
            <span>关闭其他</span>
          </ContextMenuItem>
        )}
        
        {/* 分隔线 */}
        <ContextMenuSeparator />
        
        {/* 最大化 */}
        {onMaximize && tab.maximizable && (
          <ContextMenuItem
            onClick={() => onMaximize(tab.value)}
            className="flex items-center gap-2"
          >
            <Maximize2 className="size-4" />
            <span>最大化</span>
          </ContextMenuItem>
        )}
        
        {/* 重新加载 */}
        {onReload && tab.reloadable && (
          <ContextMenuItem
            onClick={() => onReload(tab.value)}
            className="flex items-center gap-2"
          >
            <RefreshCw className="size-4" />
            <span>重新加载</span>
          </ContextMenuItem>
        )}
        
        {/* 在新标签页中打开 */}
        {onOpenInNewTab && tab.openInNewTab && (
          <ContextMenuItem
            onClick={() => onOpenInNewTab(tab.value)}
            className="flex items-center gap-2"
          >
            <ExternalLink className="size-4" />
            <span>在新的浏览器标签打开</span>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}