/* eslint-disable @eslint-react/exhaustive-deps */
import storage from "@rap/utils/storage";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useLayout } from "@/layouts/context/layout-context";
import type { AppTabItem } from "../types";

const TABS_CACHE_KEY = "layout-tabs-data";
const SELECTED_TAB_CACHE_KEY = "layout-selected-tab";

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
		storage.getItem(SELECTED_TAB_CACHE_KEY) ?? null,
	);

	const setActiveTab = (
		tabItem: AppTabItem | null | ((prevTab: AppTabItem | null) => AppTabItem | null),
	) => {
		_setActiveTab((prevActiveTab) => {
			const newActiveTab = typeof tabItem === "function" ? tabItem(prevActiveTab) : tabItem;
			storage.setItem(SELECTED_TAB_CACHE_KEY, activeTab);
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
			if (prevTabs.some((tab) => tab.id === tabItem.id)) return prevTabs;
			return [...prevTabs, tabItem];
		});
		setActiveTab(tabItem);
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
			selectedTab.fullUrl = fullUrl;
			queueMicrotask(() => {
				addTab(selectedTab);
			});
		}
	}, [fullUrl, pathname]);

	return {
		activeTab,
		tabs,
		setActiveTab,
		setTabs,
		handleTabItemClick,
		// handleCloseTab,
	};
}
