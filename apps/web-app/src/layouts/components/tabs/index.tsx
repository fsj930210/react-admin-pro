import { Button } from "@rap/components-ui/button";
import { cn } from "@rap/utils";
import { ChevronLeft, ChevronRight, LayoutGrid, Maximize, Minimize, RotateCw } from "lucide-react";
import { TabsContextMenu } from "./components/context-menu";
import { ScrollButton } from "./components/scroll-button";
import { SortableTabs } from "./components/sortable-tabs";
import { CardTabItem } from "./components/tab-item/card-tab-item";
import { ChromeLikeTabItem } from "./components/tab-item/chrome-like-tab-item";
import { ClassicTabItem } from "./components/tab-item/classic-tab-item";
import { TrapezoidTabItem } from "./components/tab-item/trapezoid-tab-item";
import { VscodeLikeTabItem } from "./components/tab-item/vscode-like-tab-item";
import { useTabs } from "./hooks/use-tabs";
import { useTabsContextMenu } from "./hooks/use-tabs-context-menu";
import { useTabsScroll } from "./hooks/use-tabs-scroll";
import type { AppTabItem, TabType } from "./types";

export interface AppTabsProps {
	sortable?: boolean;
	tabType?: TabType;
	isMaximized?: boolean;
}

const TabItemStrategies = {
	chrome: ChromeLikeTabItem,
	classic: ClassicTabItem,
	card: CardTabItem,
	vscode: VscodeLikeTabItem,
	trapezoid: TrapezoidTabItem,
};

export function AppTabs({
	sortable = true,
	tabType = "chrome",
	isMaximized = false,
}: AppTabsProps) {
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
	const { tabs, activeTab, setTabs, handleTabItemClick, setActiveTab } = useTabs(scrollToTab);
	const { handleCloseTab, handleReloadTab, handleMaximizeTab } = useTabsContextMenu({
		updateTabs: setTabs,
		setActiveTab,
		activeTab,
	});

	const handleTabClick = (item: AppTabItem) => {
		handleTabItemClick(item);
		scrollToTab(item.id);
	};

	const TabItemComponent = TabItemStrategies[tabType] || TabItemStrategies.chrome;

	return (
		<div
			className={cn("relative flex h-9 bg-app-tabs", {
				"border-b border-solid border-app-tabs-border":
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
									[`app-tabs-${tabType}-tab-item`]: true,
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
			<div className="flex-center">
				<TabsContextMenu
					key={activeTab?.id ?? ""}
					tab={activeTab}
					tabs={tabs}
					updateTabs={setTabs}
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					className="flex-center border-l-app-tabs-border border-l"
				>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="cursor-pointer"
						title="操作当前页"
					>
						<LayoutGrid className="size-4" />
					</Button>
				</TabsContextMenu>
				<div className="border-l-app-tabs-border border-l">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="cursor-pointer"
						onClick={() => handleReloadTab(activeTab)}
						title="刷新"
					>
						<RotateCw className="size-4" />
					</Button>
				</div>
				<div className="border-l-app-tabs-border border-l">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="cursor-pointer"
						onClick={() => handleMaximizeTab(activeTab)}
						title={isMaximized ? "向下还原" : "最大化"}
					>
						{isMaximized ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
					</Button>
				</div>
			</div>
			<ScrollButton canScroll={canScrollRight} direction="right" scroll={scrollRight}>
				<ChevronRight />
			</ScrollButton>
		</div>
	);
}
