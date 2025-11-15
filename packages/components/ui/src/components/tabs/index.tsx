
import { Sortable, SortableContent, SortableItem, SortableOverlay } from "@rap/components-base/sortable";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { TabsContextMenu } from "./components/context-menu";
import { ChromeLikeTabItem } from "./components/tab-item/chrome-like-tab-item";
import { useTabsContextMenu } from "./hooks/use-tabs-context-menu";
import { useTabsScroll } from "./hooks/use-tabs-scroll";
import type { LayoutTabItem, LayoutTabsProps } from "./types";
// import { VscodeLikeTabItem } from "./components/vscode-like-tab-item";
// import { TrapezoidTabItem } from "./components/trapezoid-tab-item";

const initialData: LayoutTabItem[] = [
  {
    label: "概览",
    value: "overview",
    reloadable: true,
    openInNewTab: true,
    maximizable: true,
  },
  {
    label: "分析",
    value: "analysis",
    reloadable: true,
    openInNewTab: true,
    maximizable: true,
  },
  {
    label: "监控",
    value: "monitor",
    reloadable: true,
    openInNewTab: true,
    fixed: true,
    maximizable: true,
  },
  {
    label: "设置",
    value: "settings",
    reloadable: true,
  },
  {
    label: "帮助",
    value: "help",
    reloadable: true,
    openInNewTab: true,
  },
  {
    label: "关于",
    value: "about",
    reloadable: true,
  },
  {
    label: "联系",
    value: "contact",
    reloadable: true,
    openInNewTab: true,
  },
  {
    label: "隐私",
    value: "privacy",
    reloadable: true,
  },
  {
    label: "条款",
    value: "terms",
    reloadable: true,
  },
  {
    label: "组件",
    value: "components",
    reloadable: true,
    openInNewTab: true,
  },
  {
    label: "echarts高级图表",
    value: "echarts-advance-charts",
    reloadable: true,
  },
  {
    label: "echarts基础图表",
    value: "echarts-basic-charts",
    reloadable: true,
  },
  {
    label: "echarts自定义图表",
    value: "echarts-custom-charts",
    reloadable: true,
  },
  {
    label: "echarts地图",
    value: "echarts-map",
    reloadable: true,
    openInNewTab: true,
  },
  {
    label: "按钮权限",
    value: "button-permissions",
    reloadable: true,
  },
  {
    label: "菜单权限",
    value: "menu-permissions",
    reloadable: true,
  },
  {
    label: "路由权限",
    value: "route-permissions",
    reloadable: true,
    openInNewTab: true,
  },
];

export function LayoutTabs({ sortable = true }: LayoutTabsProps = {}) {
  const {
    containerRef,
    tabsRef,
    canScrollLeft,
    canScrollRight,
    handleWheel,
    handleScroll,
    handleTouchStart,
    handleTouchMove,
    scrollToLeft,
    scrollRight,
    scrollToTab
  } = useTabsScroll();

  // 使用自定义hook处理标签页上下文菜单逻辑
  const {
    tabs,
    selectedTab,
    handleTabClick: handleTabClickBase,
    handleCloseTab,
    handlePinTab,
    handleCloseLeftTabs,
    handleCloseRightTabs,
    handleCloseOtherTabs,
    handleReloadTab,
    handleOpenInNewTab,
    handleMaximize,
    handleTabsSort
  } = useTabsContextMenu({
    initialTabs: initialData,
    initialSelectedTab: initialData[0]?.value || ''
  });

  // 处理tab点击（结合滚动）
  const handleTabClick = (tabValue: string) => {
    handleTabClickBase(tabValue);
    scrollToTab(tabValue);
  };


  // 渲染单个标签页项
  const renderTabItem = (item: LayoutTabItem) => (
    <TabsContextMenu
      key={item.value}
      tab={item}
      tabs={tabs}
      selectedTab={selectedTab}
      onClose={handleCloseTab}
      onPin={handlePinTab}
      onReload={handleReloadTab}
      onOpenInNewTab={handleOpenInNewTab}
      onMaximize={handleMaximize}
      onCloseLeft={handleCloseLeftTabs}
      onCloseRight={handleCloseRightTabs}
      onCloseOthers={handleCloseOtherTabs}
    >
      <ChromeLikeTabItem
        tab={item}
        onClick={() => handleTabClick(item.value)}
        active={selectedTab === item.value}
        onClose={handleCloseTab}
      />
    </TabsContextMenu>
  );

  return (
    <div className="relative h-20 bg-layout-tabs">
      {/* 向前滚动按钮 */}
      {canScrollLeft && (
        <button
          onClick={scrollToLeft}
          className="absolute left-0 top-0 h-full px-2 flex-center bg-layout-tabs/90 hover:bg-layout-tabs z-10 transition-all duration-200 shadow-md hover:shadow-lg animate-pulse"
          aria-label="滚动到左侧"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* 向后滚动按钮 */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-0 h-full px-2 flex-center bg-layout-tabs/90 hover:bg-layout-tabs z-10 transition-all duration-200 shadow-md hover:shadow-lg animate-pulse"
          aria-label="滚动到右侧"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* 可滚动的容器 */}
      <div
        ref={containerRef}
        className="h-full overflow-x-auto whitespace-nowrap no-scrollbar touch-action-pan-x"
        style={{ touchAction: 'pan-x' }}
        onWheel={handleWheel}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}

      >
        {/* 标签页列表 - 根据sortable属性决定是否使用拖拽排序 */}
        {sortable ? (
          <Sortable
            value={tabs}
            onValueChange={handleTabsSort}
            orientation="horizontal"
            getItemValue={(item) => item.value}
          >
            <SortableContent ref={tabsRef} className="h-full flex items-center">
              {tabs.map((item) => (
                item.fixed ? (
                  <div key={item.value} className="flex items-center">
                    {renderTabItem(item)}
                  </div>
                ) : (
                  <SortableItem
                    key={item.value}
                    value={item.value}
                    className="flex items-center"
                    asHandle
                  >
                    {renderTabItem(item)}
                  </SortableItem>
                )
              ))}
            </SortableContent>
            <SortableOverlay>
              <div className="h-full bg-primary/10" />
            </SortableOverlay>
          </Sortable>
        ) : (
          <div ref={tabsRef} className="h-full flex items-center">
            {tabs.map((item) => (
              <div key={item.value} className="flex items-center">
                {renderTabItem(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




export function SortableDemo() {
  const [tricks, setTricks] = useState([
    {
      id: "1",
      title: "The 900",
      description: "The 900 is a trick where you spin 900 degrees in the air.",
    },
    {
      id: "2",
      title: "Indy Backflip",
      description:
        "The Indy Backflip is a trick where you backflip in the air.",
    },
    {
      id: "3",
      title: "Pizza Guy",
      description: "The Pizza Guy is a trick where you flip the pizza guy.",
    },
    {
      id: "4",
      title: "Rocket Air",
      description: "The Rocket Air is a trick where you rocket air.",
    },
    {
      id: "5",
      title: "Kickflip Backflip",
      description:
        "The Kickflip Backflip is a trick where you kickflip backflip.",
    },
    {
      id: "6",
      title: "FS 540",
      description: "The FS 540 is a trick where you fs 540.",
    },
  ]);

  return (
    <Sortable
      value={tricks}
      onValueChange={setTricks}
      getItemValue={(item) => item.id}
      orientation="mixed"
    >
      <SortableContent className="grid auto-rows-fr grid-cols-3 gap-2.5">
        {tricks.map((trick) => (
          <SortableItem key={trick.id} value={trick.id} asChild asHandle>
            <div className="flex size-full flex-col gap-1 rounded-md border bg-zinc-100 p-4 text-foreground shadow-sm dark:bg-zinc-900">
              <div className="font-medium text-sm leading-tight sm:text-base">
                {trick.title}
              </div>
              <span className="line-clamp-2 hidden text-muted-foreground text-sm sm:inline-block">
                {trick.description}
              </span>
            </div>
          </SortableItem>
        ))}
      </SortableContent>
      <SortableOverlay>
        <div className="size-full rounded-md bg-primary/10" />
      </SortableOverlay>
    </Sortable>
  );
}
