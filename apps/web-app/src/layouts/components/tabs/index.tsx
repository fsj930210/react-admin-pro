import { cn } from "@rap/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TabsContextMenu } from "./components/context-menu";
import { ScrollButton } from "./components/scroll-button";
import { SortableTabs } from "./components/sortable-tabs";
import { CardTabItem } from "./components/tab-item/card-tab-item";
import { ChromeLikeTabItem } from "./components/tab-item/chrome-like-tab-item";
import { ClassicTabItem } from "./components/tab-item/classic-tab-item";
import { TrapezoidTabItem } from "./components/tab-item/trapezoid-tab-item";
import { VscodeLikeTabItem } from "./components/tab-item/vscode-like-tab-item";
import { useTabs } from "./hooks/use-tabs";
import { useTabsScroll } from "./hooks/use-tabs-scroll";
import type { LayoutTabItem, TabType } from "./types";

export interface AppTabsProps {
	sortable?: boolean;
	tabType?: TabType;
}

const TabItemStrategies = {
	chrome: ChromeLikeTabItem,
	classic: ClassicTabItem,
	card: CardTabItem,
	vscode: VscodeLikeTabItem,
	trapezoid: TrapezoidTabItem,
};

export function AppTabs({ sortable = true, tabType = "chrome" }: AppTabsProps) {
	const { tabs, activeTab, setTabs, handleTabItemClick, setActiveTab, handleCloseTab } = useTabs();

	const {
		containerRef,
		canScrollLeft,
		canScrollRight,
		handleWheel,
		handleScroll,
		handleTouchStart,
		handleTouchMove,
		scrollToLeft,
		scrollRight,
		scrollToTab,
	} = useTabsScroll();

	const handleTabClick = (item: LayoutTabItem) => {
		handleTabItemClick(item);
		scrollToTab(item.id);
	};

	const TabItemComponent = TabItemStrategies[tabType] || TabItemStrategies.chrome;

	return (
		<div
			className={cn("relative flex h-9 bg-layout-tabs", {
				"border-b border-solid border-layout-tabs-border":
					tabType !== "chrome" && tabType !== "trapezoid",
			})}
		>
			<ScrollButton canScroll={canScrollLeft} direction="left" scroll={scrollToLeft}>
				<ChevronLeft size={16} />
			</ScrollButton>
			<div
				ref={containerRef}
				className={cn(
					"size-full overflow-x-auto whitespace-nowrap no-scrollbar touch-action-pan-x",
					{
						"px-2": tabType === "card",
					},
				)}
				style={{ touchAction: "pan-x" }}
				onWheel={handleWheel}
				onScroll={handleScroll}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
			>
				{sortable ? (
					<SortableTabs tabs={tabs} setTabs={setTabs} activeTab={activeTab} tabType={tabType}>
						{(item, index) => (
							<TabsContextMenu
								key={item.id}
								tab={item}
								tabs={tabs}
								updateTabs={setTabs}
								activeTab={activeTab}
								setActiveTab={setActiveTab}
							>
								<TabItemComponent
									tab={item}
									active={activeTab?.id === item.id}
									onClose={handleCloseTab}
									onItemClick={handleTabClick}
									index={index}
								/>
							</TabsContextMenu>
						)}
					</SortableTabs>
				) : (
					<div
						className={cn("size-full flex items-center", {
							"gap-2": tabType === "card",
						})}
					>
						{tabs.map((item, index) => (
							<div
								key={item.id}
								data-tab-key={item.id}
								className={cn("group relative flex items-center h-full w-fit max-w-45", {
									active: activeTab?.id === item.id,
									[`layout-tabs-${tabType}-tab-item`]: true,
								})}
								role="tab"
								tabIndex={index}
							>
								<TabsContextMenu
									key={item.id}
									tab={item}
									tabs={tabs}
									updateTabs={setTabs}
									activeTab={activeTab}
									setActiveTab={setActiveTab}
									className="w-fit max-w-45"
								>
									<TabItemComponent
										tab={item}
										active={activeTab?.id === item.id}
										onClose={handleCloseTab}
										onItemClick={handleTabClick}
										index={index}
									/>
								</TabsContextMenu>
							</div>
						))}
					</div>
				)}
			</div>
			<ScrollButton canScroll={canScrollRight} direction="right" scroll={scrollRight}>
				<ChevronRight />
			</ScrollButton>
		</div>
	);
}
