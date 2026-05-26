import { useAppContext } from "@/app-context";
import { useNavigate } from "@tanstack/react-router";
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
	const navigate = useNavigate();
	const getTabHref = (tabItem: AppTabItem | null | undefined) =>
		tabItem?.fullUrl ?? tabItem?.url ?? "";

	const handleCloseTab = (tabItem: AppTabItem | null) => {
		updateTabs((tabs) => {
			const tabIndex = tabs.findIndex((tab) => tab.id === tabItem?.id);
			if (tabs.length <= 1) return tabs;

			if (activeTab?.id === tabItem?.id) {
				const nextTabIndex = tabIndex < tabs.length - 1 ? tabIndex + 1 : tabIndex - 1;
				const nextTab = tabs[nextTabIndex];
				setActiveTab(nextTab);
				if (nextTab) {
					void navigate({ to: getTabHref(nextTab), replace: true });
				}
			}

			eventBus.emit({
				type: "remove-tab",
				payload: [getTabHref(tabItem)],
			});
			return tabs.filter((tab) => tab.id !== tabItem?.id);
		});
	};

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
			}

			const pinnedTabs = newTabs.filter((tab) => tab.pinned);
			const nonFixedTabs = newTabs.filter((tab) => !tab.pinned);
			return [...pinnedTabs, ...nonFixedTabs, { ...tabToPin, pinned: false }];
		});
	};

	const handleCloseLeftTabs = (tabItem: AppTabItem | null) => {
		updateTabs((tabs) => {
			const currentIndex = tabs.findIndex((tab) => tab.id === tabItem?.id);
			const newTabs = tabs.filter((tab, index) => index >= currentIndex || tab.pinned);
			const willRemoveTabs = tabs.filter((tab, index) => index < currentIndex && !tab.pinned);
			eventBus.emit({
				type: "remove-tab",
				payload: willRemoveTabs.map(getTabHref),
			});
			return newTabs;
		});
	};

	const handleCloseRightTabs = (tabItem: AppTabItem | null) => {
		updateTabs((tabs) => {
			const currentIndex = tabs.findIndex((tab) => tab.id === tabItem?.id);
			const newTabs = tabs.filter((tab, index) => index <= currentIndex || tab.pinned);
			const willRemoveTabs = tabs.filter((tab, index) => index > currentIndex && !tab.pinned);
			eventBus.emit({
				type: "remove-tab",
				payload: willRemoveTabs.map(getTabHref),
			});
			return newTabs;
		});
	};

	const handleCloseOtherTabs = (tabItem: AppTabItem | null) => {
		updateTabs((tabs) => {
			const newTabs = tabs.filter((tab) => tab.id === tabItem?.id || tab.pinned);
			const willRemoveTabs = tabs.filter((tab) => tab.id !== tabItem?.id && !tab.pinned);
			eventBus.emit({
				type: "remove-tab",
				payload: willRemoveTabs.map(getTabHref),
			});
			return newTabs;
		});
	};

	const handleReloadTab = (tabItem: AppTabItem | null) => {
		eventBus.emit({
			type: "reload-tab",
			payload: getTabHref(tabItem),
		});
	};

	const handleOpenInNewTab = (tabItem: AppTabItem | null) => {
		const origin = window.location.origin;
		const url = origin + getTabHref(tabItem);
		window.open(url, "_blank");
	};

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
