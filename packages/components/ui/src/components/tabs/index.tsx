import { cn } from "@rap/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TabsContextMenu } from "./components/context-menu";
import { ScrollButton } from "./components/scroll-button";
import { SortableTabs } from "./components/sortable-tabs";
import { CardTabItem } from "./components/tab-item/card-tab-item";
import { ChromeLikeTabItem } from "./components/tab-item/chrome-like-tab-item";
import { ClassicTabItem } from "./components/tab-item/classic-tab-item";
import { TrapezoidTabItem } from "./components/tab-item/trapezoid-tab-item";
import { VscodeLikeTabItem } from "./components/tab-item/vscode-like-tab-item";
import { useTabs } from "./hooks/use-tabs";
import { useTabsScroll } from "./hooks/use-tabs-scroll";
import type { LayoutTabItem, TabType } from "./types";

export type LayoutTabsProps = {
  sortable?: boolean;
  activeTab?: string;
  defaultActiveTab?: string;
  tabType?: TabType;
};

// Tab Item 渲染策略对象
const TabItemStrategies = {
  chrome: ChromeLikeTabItem,
  classic: ClassicTabItem,
  card: CardTabItem,
  vscode: VscodeLikeTabItem,
  trapezoid: TrapezoidTabItem,
};

export function LayoutTabs({
  sortable = false,
  tabType = "card",
  defaultActiveTab,
}: LayoutTabsProps) {
  const {
    tabs,
    activeTab,
    updateTabs,
    handleTabItemClick,
    setActiveTab,
    handleCloseTab,
  } = useTabs(defaultActiveTab);

  const {
    containerRef,
    canScrollLeft,
    canScrollRight,
    handleWheel,
    handleScroll,
    handleTouchStart,
    handleTouchMove,
    scrollToLeft,
    scrollRight,
    scrollToTab,
  } = useTabsScroll();

  // 添加一个 setter 函数用于 SortableTabs
  const setTabs = (
    newTabs: LayoutTabItem[] | ((prev: LayoutTabItem[]) => LayoutTabItem[])
  ) => {
    if (typeof newTabs === "function") {
      updateTabs(newTabs);
    } else {
      updateTabs(() => newTabs);
    }
  };

  // 处理tab点击（结合滚动）
  const handleTabClick = (item: LayoutTabItem) => {
    handleTabItemClick(item);
    scrollToTab(item.key);
  };

  // 获取当前tab类型的组件
  const TabItemComponent =
    TabItemStrategies[tabType] || TabItemStrategies.chrome;

  return (
    <div className="relative flex h-9 bg-layout-tabs">
      <ScrollButton
        canScroll={canScrollLeft}
        direction="left"
        scroll={scrollToLeft}
      >
        <ChevronLeft size={16} />
      </ScrollButton>
      <div
        ref={containerRef}
        className="size-full px-2 overflow-x-auto whitespace-nowrap no-scrollbar touch-action-pan-x"
        style={{ touchAction: "pan-x" }}
        onWheel={handleWheel}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {sortable ? (
          <div className="inline-flex items-center h-full">
            <SortableTabs
              tabs={tabs}
              setTabs={setTabs}
              activeTab={activeTab}
              tabType={tabType}
            >
              {(item) => (
                <TabsContextMenu
                  key={item.key}
                  tab={item}
                  tabs={tabs}
                  updateTabs={updateTabs}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                >
                  <TabItemComponent
                    tab={item}
                    active={activeTab === item.key}
                    onClose={handleCloseTab}
                  />
                </TabsContextMenu>
              )}
            </SortableTabs>
          </div>
        ) : (
          <div
            className={cn("inline-flex items-center h-full", {
              "gap-2": tabType === "card",
            })}
          >
            {tabs.map((item, index) => (
              <TabsContextMenu
                key={item.key}
                tab={item}
                tabs={tabs}
                updateTabs={updateTabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              >
                <div
                  key={item.key}
                  data-tab-key={item.key}
                  className={cn("group flex-items-center size-full", {
                    active: activeTab === item.key,
                    [`layout-tabs-${tabType}-tab-item`]: true,
                  })}
                  onClick={() => handleTabClick(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleTabClick(item);
                    }
                  }}
                  role="tab"
                  tabIndex={index}
                >
                  <TabItemComponent
                    tab={item}
                    active={activeTab === item.key}
                    onClose={handleCloseTab}
                  />
                </div>
              </TabsContextMenu>
            ))}
          </div>
        )}
      </div>
      <ScrollButton
        canScroll={canScrollRight}
        direction="right"
        scroll={scrollRight}
      >
        <ChevronRight />
      </ScrollButton>
    </div>
  );
}

export type { useTabs as UseTabsReturn } from "./hooks/use-tabs";
// 导出额外的功能供外部使用
export { useTabs } from "./hooks/use-tabs";
