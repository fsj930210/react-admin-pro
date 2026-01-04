import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from "@rap/components-base/sortable";
import { cn } from "@rap/utils";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { LayoutTabItem, TabType } from "../types";

interface SortableTabsProps {
  tabs: LayoutTabItem[];
  setTabs: Dispatch<SetStateAction<LayoutTabItem[]>>;
  children: (item: LayoutTabItem) => ReactNode;
  activeTab: string;
  tabType: TabType;
}

export function SortableTabs({
  tabs,
  setTabs,
  children,
  activeTab,
  tabType,
}: SortableTabsProps) {
  const handleTabsSort = (newTabs: LayoutTabItem[]) => {
    // 将固定标签页始终放在前面
    const pinnedTabs = newTabs.filter((tab) => tab.pinned);
    const nonPinnedTabs = newTabs.filter((tab) => !tab.pinned);
    const sortedTabs = [...pinnedTabs, ...nonPinnedTabs];
    setTabs(sortedTabs);
  };
  return (
    <Sortable
      value={tabs}
      onValueChange={handleTabsSort}
      orientation="horizontal"
      getItemValue={(item) => item.key}
    >
      <SortableContent
        className={cn("size-full flex-items-center ", {
          "gap-2": tabType === "card",
        })}
      >
        {tabs.map((item, index) =>
          item.pinned ? (
            <div
              key={item.key}
              data-tab-key={item.key}
              className={cn(
                "group layout-tabs-tab-item flex-items-center size-full",
                {
                  active: activeTab === item.key,
                  [`layout-tabs-${tabType}-tab-item`]: true,
                }
              )}
              role="tab"
              tabIndex={index}
            >
              {children(item)}
            </div>
          ) : (
            <SortableItem
              key={item.key}
              value={item.key}
              className={cn(
                "group layout-tabs-tab-item flex-items-center size-full",
                {
                  active: activeTab === item.key,
                  [`layout-tabs-${tabType}-tab-item`]: true,
                }
              )}
              data-tab-key={item.key}
              role="tab"
              tabIndex={index}
              asHandle
            >
              {children(item)}
            </SortableItem>
          )
        )}
      </SortableContent>
      <SortableOverlay>
        {(activeItem) => {
          const item = tabs.find((tabItem) => tabItem.key === activeItem.value);

          if (!item) return null;

          return children(item);
        }}
      </SortableOverlay>
    </Sortable>
  );
}
