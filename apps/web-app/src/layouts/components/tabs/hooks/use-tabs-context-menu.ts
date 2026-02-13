import type { LayoutTabItem } from "../types";

interface UseTabsContextMenuProps {
	updateTabs: React.Dispatch<React.SetStateAction<LayoutTabItem[]>>;
	setActiveTab: React.Dispatch<React.SetStateAction<LayoutTabItem | null>>;
	activeTab: LayoutTabItem | null;
}

// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix
export function useTabsContextMenu({
	updateTabs,
	setActiveTab,
	activeTab,
}: UseTabsContextMenuProps) {
	// 关闭当前标签页
	const handleCloseTab = (tabId: string) => {
		updateTabs((tabs) => {
			const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
			if (tabs.length <= 1) return tabs;
			if (activeTab?.id === tabId) {
				const nextTabIndex = tabIndex < tabs.length - 1 ? tabIndex : tabIndex - 1;
				setActiveTab(tabs[nextTabIndex]);
				// todo: 跳转到新的标签页
			}
			return tabs.filter((tab) => tab.id !== tabId);
		});
	};

	// 固定/取消固定标签页
	const handlePinTab = (tabId: string) => {
		updateTabs((tabs) => {
			const tabToPin = tabs.find((tab) => tab.id === tabId);
			if (!tabToPin) return tabs;

			const newTabs = tabs.filter((tab) => tab.id !== tabId);
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
	const handleCloseLeftTabs = (tabId: string) => {
		updateTabs((tabs) => {
			const currentIndex = tabs.findIndex((tab) => tab.id === tabId);

			// 只关闭非固定的标签页
			const newTabs = tabs.filter((tab, index) => index >= currentIndex || tab.pinned);
			return newTabs;
		});
	};

	// 关闭右侧标签页
	const handleCloseRightTabs = (tabId: string) => {
		updateTabs((tabs) => {
			const currentIndex = tabs.findIndex((tab) => tab.id === tabId);

			// 只关闭非固定的标签页
			const newTabs = tabs.filter((tab, index) => index <= currentIndex || tab.pinned);

			return newTabs;
		});
	};

	// 关闭其他标签页
	const handleCloseOtherTabs = (tabId: string) => {
		updateTabs((tabs) => {
			// 只保留当前标签页和固定的标签页
			const newTabs = tabs.filter((tab) => tab.id === tabId || tab.pinned);

			return newTabs;
		});
	};

	// 重新加载标签页
	const handleReloadTab = (tabId: string) => {
		console.log(`重新加载标签页: ${tabId}`);
		// 实际项目中可以在这里添加重新加载的逻辑
	};

	// 在新标签页中打开
	const handleOpenInNewTab = (tabId: string) => {
		const origin = window.location.origin;
		const url = origin + tabId;
		window.open(url, "_blank");
	};

	// 最大化标签页
	const handleMaximize = (tabId: string) => {
		console.log(`最大化标签页: ${tabId}`);
		// 实际项目中可以在这里添加最大化的逻辑
	};

	return {
		handleCloseTab,
		handlePinTab,
		handleCloseLeftTabs,
		handleCloseRightTabs,
		handleCloseOtherTabs,
		handleReloadTab,
		handleOpenInNewTab,
		handleMaximize,
	};
}
