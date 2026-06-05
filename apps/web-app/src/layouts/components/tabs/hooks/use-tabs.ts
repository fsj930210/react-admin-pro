/* eslint-disable @eslint-react/exhaustive-deps */
import storage from "@rap/utils/storage";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useLayout } from "@/layouts/context/layout-context";
import type { AppTabItem } from "../types";

const TABS_CACHE_KEY = "layout-tabs-data";
const SELECTED_TAB_CACHE_KEY = "layout-selected-tab";

function isSameBadge(left: AppTabItem["badge"], right: AppTabItem["badge"]) {
  if (left === right) return true;
  if (!left || !right) return false;

  return (
    left.type === right.type &&
    left.text === right.text &&
    left.color === right.color &&
    left.customColor === right.customColor
  );
}

function syncTabLocaleText(tab: AppTabItem, menu: AppTabItem): AppTabItem {
  const unchanged = tab.title === menu.title && isSameBadge(tab.badge, menu.badge);

  if (unchanged) return tab;

  return {
    ...tab,
    title: menu.title,
    badge: menu.badge,
  };
}

export function useTabs(scrollToTab: (tabKey: string) => void) {
  const navigate = useNavigate();
  const { menuService } = useLayout();
  const isTabItemClickRef = useRef(false);
  const fullUrl = useRouterState({
    select: (state) => state.location.pathname + state.location.searchStr,
  });
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  // eslint-disable-next-line @eslint-react/use-state
  const [tabs, _setTabs] = useState<AppTabItem[]>(storage.getItem(TABS_CACHE_KEY) ?? []);

  // eslint-disable-next-line @eslint-react/use-state
  const [activeTab, _setActiveTab] = useState<AppTabItem | null>(
    storage.getItem(SELECTED_TAB_CACHE_KEY) ?? null
  );

  const setActiveTab = (
    tabItem: AppTabItem | null | ((prevTab: AppTabItem | null) => AppTabItem | null)
  ) => {
    _setActiveTab((prevActiveTab) => {
      const newActiveTab = typeof tabItem === "function" ? tabItem(prevActiveTab) : tabItem;
      storage.setItem(SELECTED_TAB_CACHE_KEY, newActiveTab);
      return newActiveTab;
    });
  };
  const setTabs = (tabsFn: AppTabItem[] | ((prevTabs: AppTabItem[]) => AppTabItem[])) => {
    _setTabs((prevTabs) => {
      const newTabs = typeof tabsFn === "function" ? tabsFn(prevTabs) : tabsFn;
      storage.setItem(TABS_CACHE_KEY, newTabs);
      return newTabs;
    });
  };

  const addTab = (tabItem: AppTabItem) => {
    setTabs((prevTabs) => {
      if (prevTabs.some((tab) => tab.id === tabItem.id)) {
        let changed = false;
        const nextTabs = prevTabs.map((tab) => {
          if (tab.id !== tabItem.id) return tab;

          const nextTab = syncTabLocaleText(tab, tabItem);
          changed ||= nextTab !== tab;
          return nextTab;
        });

        return changed ? nextTabs : prevTabs;
      }
      return [...prevTabs, tabItem];
    });
    setActiveTab((prevTab) =>
      prevTab?.id === tabItem.id ? syncTabLocaleText(prevTab, tabItem) : tabItem
    );
    scrollToTab?.(tabItem.id);
  };
  const handleTabItemClick = (item: AppTabItem) => {
    if (item.id === activeTab?.id) return;
    addTab(item);
    isTabItemClickRef.current = true;
    navigate({
      to: item.url,
    });
  };
  // biome-ignore lint:correctness/useExhaustiveDependencies
  useEffect(() => {
    if (isTabItemClickRef.current) {
      isTabItemClickRef.current = false;
      return;
    }
    const selectedTab = menuService.findMenuByUrl(pathname);
    if (selectedTab) {
      const tabItem = {
        ...selectedTab,
        fullUrl,
      };
      queueMicrotask(() => {
        addTab(tabItem);
      });
    }
  }, [fullUrl, menuService, pathname]);

  useEffect(() => {
    setTabs((prevTabs) => {
      let changed = false;
      const nextTabs = prevTabs.map((tab) => {
        const menu = menuService.findMenuForTab(tab);
        if (!menu) return tab;

        const nextTab = syncTabLocaleText(tab, menu);
        changed ||= nextTab !== tab;
        return nextTab;
      });

      return changed ? nextTabs : prevTabs;
    });

    setActiveTab((prevTab) => {
      if (!prevTab) return prevTab;

      const menu = menuService.findMenuForTab(prevTab);
      return menu ? syncTabLocaleText(prevTab, menu) : prevTab;
    });
  }, [menuService]);

  return {
    activeTab,
    tabs,
    setActiveTab,
    setTabs,
    handleTabItemClick,
    // handleCloseTab,
  };
}
