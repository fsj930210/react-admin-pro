import { Sortable } from "@rap/components-ui/sortable";
import { cn } from "@rap/utils";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { AppTabItem, TabType } from "../types";

interface CustomSortableTabsProps {
  tabs: AppTabItem[];
  activeTab: AppTabItem | null;
  tabType: TabType;
  setTabs: Dispatch<SetStateAction<AppTabItem[]>>;
  children: (item: AppTabItem, index: number) => ReactNode;
}

export function SortableTabs({
  tabs,
  activeTab,
  tabType,
  setTabs,
  children,
}: CustomSortableTabsProps) {
  return (
    <Sortable.Root
      items={tabs.map((tab) => tab.id)}
      onItemsChange={(ids) =>
        setTabs((current) => {
          const tabById = new Map(current.map((tab) => [tab.id, tab]));
          const next = ids.map((id) => tabById.get(String(id))).filter(Boolean) as AppTabItem[];
          return next.length === current.length ? next : current;
        })
      }
      orientation="horizontal"
      flatCursor
      activationDistance={10}
    >
      <Sortable.List
        asChild
        className={cn("size-full flex items-center ", {
          "gap-2": tabType === "card",
        })}
      >
        <div>
          {tabs.map((item, index) => (
            <Sortable.Item
              key={item.id}
              id={item.id}
              asChild
              handle
              disabled={item.pinned}
              data-tab-key={item.id}
            >
              <div
                data-tab-key={item.id}
                className={cn(
                  "group relative app-tabs-tab-item flex items-center h-full w-fit max-w-45",
                  {
                    active: activeTab?.id === item.id,
                    [`app-tabs-${tabType}-tab-item`]: true,
                  }
                )}
                role="tab"
                tabIndex={index}
              >
                {children(item, index)}
              </div>
            </Sortable.Item>
          ))}
        </div>
      </Sortable.List>
    </Sortable.Root>
  );
}
