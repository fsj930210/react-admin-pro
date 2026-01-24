import { useEffect, useRef, useState } from "react";
import type { LayoutTabItem } from "../types";
import { useNavigate, useRouterState } from '@tanstack/react-router';
import storage from '@rap/utils/storage';
import { useLayoutSidebar } from "../../sidebar/sidebar-context";

const TABS_CACHE_KEY = "layout-tabs-data";
const SELECTED_TAB_CACHE_KEY = "layout-selected-tab";

export function useTabs() {
	const navigate = useNavigate();
	const { findMenuByUrl } = useLayoutSidebar();
	const isTabItemClickRef = useRef(false);
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	})
  const [tabs, _setTabs] = useState<LayoutTabItem[]>(storage.getItem(TABS_CACHE_KEY) ?? []);

  const [activeTab, _setActiveTab] = useState<LayoutTabItem | null>(storage.getItem(SELECTED_TAB_CACHE_KEY) ?? null);

	const setActiveTab = (tabItem: LayoutTabItem | null | ((prevTab: LayoutTabItem | null) => LayoutTabItem | null)) => {
    _setActiveTab((prevActiveTab) => {
			const newActiveTab = typeof tabItem == 'function' ? tabItem(prevActiveTab) : tabItem;
			storage.setItem(SELECTED_TAB_CACHE_KEY, activeTab);
			return newActiveTab;
		});

  };
	const setTabs = (tabsFn: LayoutTabItem[] | ((prevTabs: LayoutTabItem[]) => LayoutTabItem[])) => {
    
    _setTabs((prevTabs) => {
			const newTabs = typeof tabsFn == 'function' ? tabsFn(prevTabs) : tabsFn;
			storage.setItem(TABS_CACHE_KEY, newTabs);
			return newTabs;
		});

  };

  const handleCloseTab = (tabId: string) => {
    setTabs((prevTabs) => {
      if (prevTabs.length <= 1) return prevTabs;
      const tabIndex = prevTabs.findIndex((tab) => tab.id === tabId);
      if (activeTab?.id === tabId) {
        const nextTabIndex =
          tabIndex < prevTabs.length - 1 ? tabIndex : tabIndex - 1;
        setActiveTab(prevTabs[nextTabIndex]);
      }
      return prevTabs.filter((tab) => tab.id !== tabId);
    });
  };
	const addTab = (tabItem: LayoutTabItem) => {
		setTabs((prevTabs) => {
			if (prevTabs.some((tab) => tab.id === tabItem.id)) return prevTabs;
			return [...prevTabs, tabItem];
		});
		setActiveTab(tabItem);
	};
	const handleTabItemClick = (item: LayoutTabItem) => {
		if (item.id === activeTab?.id) return;
		addTab(item);
    isTabItemClickRef.current = true;
    navigate({
			to: item.url,
		});
  };
	useEffect(() => {
		if (isTabItemClickRef.current) {
			isTabItemClickRef.current = false;
			return;
		}
		const selectedTab = findMenuByUrl(pathname);
		
		if (selectedTab) {
			queueMicrotask(() => {
				addTab(selectedTab);
			})
		}
		
  }, [pathname]);

  return {
    activeTab,
    tabs,
    setActiveTab,
    setTabs,
    handleTabItemClick,
    handleCloseTab,
  };
}
