import { ChromeLikeTabItem } from "./chrome-like-tabs";
import { useState } from "react";
import type { LayoutTabItem } from "./types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTabsScroll } from "./use-tabs-scroll";
// import { VscodeLikeTabs } from "./vscode-like-tabs";
// import { TrapezoidTabs } from "./trapezoid-tabs";

const data: LayoutTabItem[] = [
  {
    label: "概览",
    value: "overview",
  },
  {
    label: "分析",
    value: "analysis",
  },
  {
    label: "监控",
    value: "monitor",
  },
  {
    label: "设置",
    value: "settings",
  },
  {
    label: "帮助",
    value: "help",
  },
  {
    label: "关于",
    value: "about",
  },
  {
    label: "联系",
    value: "contact",
  },
  {
    label: "隐私",
    value: "privacy",
  },
  {
    label: "条款",
    value: "terms",
  },
  {
    label: "组件",
    value: "components",
  },
  {
    label: "echarts高级图表",
    value: "echarts-advance-charts",
  },
  {
    label: "echarts基础图表",
    value: "echarts-basic-charts",
  },
  {
    label: "echarts自定义图表",
    value: "echarts-custom-charts",
  },
  {
    label: "echarts地图",
    value: "echarts-map",
  },
  {
    label: "按钮权限",
    value: "button-permissions",
  },
  {
    label: "菜单权限",
    value: "menu-permissions",
  },
  {
    label: "路由权限",
    value: "route-permissions",
  },
];

export function LayoutTabs() {
  const [selectedTab, setSelectedTab] = useState<string>(data[0]?.value || '');
  
  // 使用组件内部的自定义hook处理滚动逻辑
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
  
  // 处理tab点击
  const handleTabClick = (tabValue: string) => {
    setSelectedTab(tabValue);
    scrollToTab(tabValue);
  };
  
  // 处理触摸结束事件
  const handleTouchEnd = () => {
    // 触摸结束时不需要特殊处理
  };
  


  return (
    <div className="relative h-9 bg-layout-tabs">
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
          onTouchEnd={handleTouchEnd}
        >
        <ol ref={tabsRef} className="h-full flex items-center">
          {data.map((item) => (
            <ChromeLikeTabItem 
              key={item.value}
              tab={item} 
              onClick={() => handleTabClick(item.value)}
              active={selectedTab === item.value}
              data-tab-value={item.value}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}
