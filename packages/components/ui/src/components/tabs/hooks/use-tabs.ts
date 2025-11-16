import { useCallback, useEffect, useState } from "react";
import type { LayoutTabItem } from "../types";

const TABS_CACHE_KEY = "layout-tabs-data";
const ACTIVE_TAB_CACHE_KEY = "layout-active-tab";

export function useTabs(defaultActiveTab?: string) {
  const [tabs, setTabs] = useState<LayoutTabItem[]>([
    {
      title: "概览",
      key: "overview",
      pinned: true,
    },
    {
      title: "分析",
      key: "analysis",
    },
    {
      title: "监控",
      key: "monitor",
    },
    {
      title: "设置",
      key: "settings",
    },
    {
      title: "帮助",
      key: "help",
    },
    {
      title: "关于",
      key: "about",
    },
    {
      title: "联系",
      key: "contact",
    },
    {
      title: "隐私",
      key: "privacy",
    },
    {
      title: "条款",
      key: "terms",
    },
    {
      title: "组件",
      key: "components",
    },
    {
      title: "echarts高级图表",
      key: "echarts-advance-charts",
    },
    {
      title: "echarts基础图表",
      key: "echarts-basic-charts",
    },
    {
      title: "echarts自定义图表",
      key: "echarts-custom-charts",
    },
    {
      title: "echarts地图",
      key: "echarts-map",
    },
    {
      title: "按钮权限",
      key: "button-permissions",
    },
    {
      title: "菜单权限",
      key: "menu-permissions",
    },
    {
      title: "路由权限",
      key: "route-permissions",
    },
  ]);

  // 从localStorage恢复激活的tab
  const getInitialActiveTab = useCallback(() => {
    if (defaultActiveTab) return defaultActiveTab;

    try {
      const cached = localStorage.getItem(ACTIVE_TAB_CACHE_KEY);
      if (cached) return cached;
    } catch (error) {
      console.warn("Failed to get active tab from cache:", error);
    }

    return "settings";
  }, [defaultActiveTab]);

  const [activeTab, setActiveTab] = useState(getInitialActiveTab());

  // 缓存tabs到localStorage
  const cacheTabs = useCallback((tabsToCache: LayoutTabItem[]) => {
    try {
      localStorage.setItem(TABS_CACHE_KEY, JSON.stringify(tabsToCache));
    } catch (error) {
      console.warn("Failed to cache tabs:", error);
    }
  }, []);

  // 从localStorage恢复tabs
  const restoreCachedTabs = useCallback(() => {
    try {
      const cached = localStorage.getItem(TABS_CACHE_KEY);
      if (cached) {
        const parsedTabs = JSON.parse(cached) as LayoutTabItem[];
        return parsedTabs;
      }
    } catch (error) {
      console.warn("Failed to restore tabs from cache:", error);
    }
    return null;
  }, []);

  // 初始化时恢复缓存
  useEffect(() => {
    const cachedTabs = restoreCachedTabs();
    if (cachedTabs && cachedTabs.length > 0) {
      setTabs(cachedTabs);
    }
  }, [restoreCachedTabs]);

  // 缓存激活的tab
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_TAB_CACHE_KEY, activeTab);
    } catch (error) {
      console.warn("Failed to cache active tab:", error);
    }
  }, [activeTab]);

  const handleTabItemClick = (item: LayoutTabItem) => {
    setActiveTab(item.key);
  };

  const handleCloseTab = (tabKey: string) => {
    setTabs((prevTabs) => {
      // 如果是最后一个标签页，不允许关闭
      if (prevTabs.length <= 1) return prevTabs;

      // 找到要关闭的标签页索引
      const tabIndex = prevTabs.findIndex((tab) => tab.key === tabKey);

      // 如果关闭的是当前选中的标签页，选择下一个或上一个标签页
      if (activeTab === tabKey) {
        const nextTabIndex =
          tabIndex < prevTabs.length - 1 ? tabIndex : tabIndex - 1;
        setActiveTab(prevTabs[nextTabIndex].key);
      }

      // 移除标签页
      return prevTabs.filter((tab) => tab.key !== tabKey);
    });
  };

  const updateTabs = (fn: (oldTabs: LayoutTabItem[]) => LayoutTabItem[]) => {
    setTabs((prev) => {
      const newTabs = fn(prev);
      cacheTabs(newTabs);
      return newTabs;
    });
  };

  // 添加新的tab
  const addTabItem = (
    tabItem: Omit<LayoutTabItem, "key"> & { key?: string }
  ) => {
    const key = tabItem.key || tabItem.title;

    updateTabs((prevTabs) => {
      // 检查tab是否已存在
      const existingTab = prevTabs.find((tab) => tab.key === key);

      if (existingTab) {
        // 如果已存在，激活该tab并"刷新"（更新title等属性）
        setActiveTab(key);
        return prevTabs.map((tab) =>
          tab.key === key ? { ...tab, ...tabItem, key } : tab
        );
      } else {
        // 如果不存在，添加新tab并激活
        const newTab: LayoutTabItem = {
          ...tabItem,
          key,
          title: tabItem.title || key,
        };

        setActiveTab(key);
        return [...prevTabs, newTab];
      }
    });
  };

  return {
    activeTab,
    setActiveTab,
    tabs,
    updateTabs,
    handleTabItemClick,
    handleCloseTab,
    addTabItem,
    cacheTabs,
    restoreCachedTabs,
  };
}
