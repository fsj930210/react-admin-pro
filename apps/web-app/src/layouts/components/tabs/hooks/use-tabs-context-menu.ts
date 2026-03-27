
import { useAppContext } from "@/app-context";
import type { AppTabItem } from "../types";

interface UseTabsContextMenuProps {
	updateTabs: React.Dispatch<React.SetStateAction<AppTabItem[]>>;
	setActiveTab: React.Dispatch<React.SetStateAction<AppTabItem | null>>;
	activeTab: AppTabItem | null;
	useRequestFullScreen?: boolean;
}

 
export function useTabsContextMenu({
	updateTabs,
	setActiveTab,
	activeTab,
}: UseTabsContextMenuProps) {
	const { eventBus } = useAppContext();
	// 关闭当前标签页
	const handleCloseTab = (tabItem: AppTabItem | null) => {
		updateTabs((tabs) => {
			const tabIndex = tabs.findIndex((tab) => tab.id === tabItem?.id);
			if (tabs.length <= 1) return tabs;
			if (activeTab?.id === tabItem?.id) {
				const nextTabIndex = tabIndex < tabs.length - 1 ? tabIndex : tabIndex - 1;
				setActiveTab(tabs[nextTabIndex]);
				// todo: 跳转到新的标签页
			}
			eventBus.emit({
				type: "remove-tab",
				payload: [tabItem?.url ?? ""],
			});
			return tabs.filter((tab) => tab.id !== tabItem?.id);
		});
	};

	// 固定/取消固定标签页
	const handlePinTab = (tabItem: AppTabItem | null) => {
		updateTabs((tabs) => {
			const tabToPin = tabs.find((tab) => tab.id === tabItem?.id);
			if (!tabToPin) return tabs;

			const newTabs = tabs.filter((tab) => tab.id !== tabItem?.id);
			const isPinning = !tabToPin.pinned;

			if (isPinning) {
				const pinnedTabs = newTabs.filter((tab) => tab.pinned);
				const nonFixedTabs = newTabs.filter((tab) => !tab.pinned);
				return [{ ...tabToPin, pinned: true }, ...pinnedTabs, ...nonFixedTabs];
			} else {
				const pinnedTabs = newTabs.filter((tab) => tab.pinned);
				const nonFixedTabs = newTabs.filter((tab) => !tab.pinned);
				return [...pinnedTabs, ...nonFixedTabs, { ...tabToPin, pinned: false }];
			}
		});
	};

	// 关闭左侧标签页
	const handleCloseLeftTabs = (tabItem: AppTabItem | null) => {
		updateTabs((tabs) => {
			const currentIndex = tabs.findIndex((tab) => tab.id === tabItem?.id);

			// 只关闭非固定的标签页
			const newTabs = tabs.filter((tab, index) => index >= currentIndex || tab.pinned);
			const willRemoveTabs = tabs.filter((tab, index) => index < currentIndex && !tab.pinned);
			eventBus.emit({
				type: "remove-tab",
				payload: willRemoveTabs.map((tab) => tab.url ?? ""),
			});
			return newTabs;
		});
	};

	// 关闭右侧标签页
	const handleCloseRightTabs = (tabItem: AppTabItem | null) => {
		updateTabs((tabs) => {
			const currentIndex = tabs.findIndex((tab) => tab.id === tabItem?.id);

			// 只关闭非固定的标签页
			const newTabs = tabs.filter((tab, index) => index <= currentIndex || tab.pinned);
			const willRemoveTabs = tabs.filter((tab, index) => index > currentIndex && !tab.pinned);
			eventBus.emit({
				type: "remove-tab",
				payload: willRemoveTabs.map((tab) => tab.url ?? ""),
			});
			return newTabs;
		});
	};

	// 关闭其他标签页
	const handleCloseOtherTabs = (tabItem: AppTabItem | null) => {
		updateTabs((tabs) => {
			// 只保留当前标签页和固定的标签页
			const newTabs = tabs.filter((tab) => tab.id === tabItem?.id || tab.pinned);
			const willRemoveTabs = tabs.filter((tab) => tab.id !== tabItem?.id && !tab.pinned);
			eventBus.emit({
				type: "remove-tab",
				payload: willRemoveTabs.map((tab) => tab.url ?? ""),
			});
			return newTabs;
		});
	};

	// 重新加载标签页
	const handleReloadTab = (tabItem: AppTabItem | null) => {
		eventBus.emit({
			type: "reload-tab",
			payload: tabItem?.url ?? "",
		});
	};

	// 在新标签页中打开
	const handleOpenInNewTab = (tabItem: AppTabItem | null) => {
		const origin = window.location.origin;
		const url = origin + (tabItem?.url ?? "");
		window.open(url, "_blank");
	};

	// 最大化标签页
	const handleMaximizeTab = (tabItem: AppTabItem | null) => {
		eventBus.emit({
			type: "maximize-tab",
			payload: tabItem?.id ?? "",
		});
	};

	return {
		handleCloseTab,
		handlePinTab,
		handleCloseLeftTabs,
		handleCloseRightTabs,
		handleCloseOtherTabs,
		handleReloadTab,
		handleOpenInNewTab,
		handleMaximizeTab,
	};
}
