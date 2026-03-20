import storage from "@rap/utils/storage";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useLayout } from "@/layouts/context/layout-context";
import type { AppTabItem } from "../types";

const TABS_CACHE_KEY = "layout-tabs-data";
const SELECTED_TAB_CACHE_KEY = "layout-selected-tab";

export function useTabs() {
	const navigate = useNavigate();
	const { menuService } = useLayout();
	const isTabItemClickRef = useRef(false);
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const [tabs, _setTabs] = useState<AppTabItem[]>(storage.getItem(TABS_CACHE_KEY) ?? []);

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

	const handleCloseTab = (tabId: string) => {
		setTabs((prevTabs) => {
			if (prevTabs.length <= 1) return prevTabs;
			const tabIndex = prevTabs.findIndex((tab) => tab.id === tabId);
			if (activeTab?.id === tabId) {
				const nextTabIndex = tabIndex < prevTabs.length - 1 ? tabIndex : tabIndex - 1;
				setActiveTab(prevTabs[nextTabIndex]);
			}
			return prevTabs.filter((tab) => tab.id !== tabId);
		});
	};
	const addTab = (tabItem: AppTabItem) => {
		setTabs((prevTabs) => {
			if (prevTabs.some((tab) => tab.id === tabItem.id)) return prevTabs;
			return [...prevTabs, tabItem];
		});
		setActiveTab(tabItem);
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
			queueMicrotask(() => {
				addTab(selectedTab);
			});
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
