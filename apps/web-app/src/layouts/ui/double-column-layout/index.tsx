
import { AppContent } from "@/layouts/components/content";
import { AppHeader } from "@/layouts/components/header";
import { SidebarMain } from "@/layouts/components/sidebar/sidebar-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
	SidebarProvider,
	useSidebar,
} from "@rap/components-base/sidebar"
import { useLayout } from "@/layouts/context/layout-context";
import type { MenuItem } from "@/layouts/types";
import { MenuItemContent } from "@/layouts/components/menu/menu-item-content";
import { useState } from "react";
import { Logo } from "@rap/components-ui/logo";
import { APP_BASE_PATH } from "@/config";
import { User } from "@/layouts/components/sidebar/sidebar-user";
import { cn } from "@rap/utils";
import { useNavigate } from "@tanstack/react-router";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

interface FirstLevelMenuProps {
	menus: MenuItem[];
	selectedItem?: MenuItem | null;
	onItemClick?: (item: MenuItem) => void;
}
function FirstLevelMenu({ menus, selectedItem, onItemClick }: FirstLevelMenuProps) {
	const navigate = useNavigate();
	const handleItemClick = (item: MenuItem) => {
		if (item.type === 'menu') {
			navigate({to: item.url});
		}
		onItemClick?.(item);
	}
		return (
		<div className="flex flex-col items-center py-2 w-25 h-full border-r">
			<Logo url={`${APP_BASE_PATH}/logo.svg`} showTitle={false} />
			<ol className="flex flex-col flex-1 w-full mt-2">
				{menus.map((item) => (
					<li 
						key={item.id}
						className={cn(
							"flex-center h-8 cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground my-1 mx-2 p-0 text-sm whitespace-nowrap overflow-hidden rounded-md",
							selectedItem?.id === item.id ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
						)}
						onClick={() => handleItemClick(item)}
					>
						<MenuItemContent
							item={item}
							searchKeywords={[]}
							showBadge={false}
							className="justify-center"
						/>
					</li>
				))}
			</ol>
			<User />
		</div>
	)
}

function DoubleColumnLayoutSidebar() {
	const { userMenus } = useLayout();
	const firstLevelMenus = userMenus || [];
	const [selectedFistLevelMenu, setSelectedFistLevelMenu] = useState<MenuItem | null>(null);
	const secondLevelMenus = selectedFistLevelMenu?.children ?? [];
	const { state, toggleSidebar } = useSidebar();
	return (
		<div className="flex">
			<FirstLevelMenu 
				menus={firstLevelMenus} 
				onItemClick={setSelectedFistLevelMenu}
				selectedItem={selectedFistLevelMenu}
			/>
			{
				secondLevelMenus.length > 0 && (
					<Sidebar 
						collapsible="icon" 
						className={`h-full left-25 flex-1 transition-all duration-300`}
					>
						<SidebarContent>
							<SidebarMain 
								menus={secondLevelMenus} 
								showSearch={false}
							/>
						</SidebarContent>
						<SidebarFooter>
							<button className="flex-center size-6 rounded-xs cursor-pointer bg-muted" onClick={toggleSidebar}>
								{
									state === 'collapsed' ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />
								}
							</button>
						</SidebarFooter>
					</Sidebar>
				)
			}
		</div>
	)
}

function DoubleColumnLayout() {
  return (
		<SidebarProvider>
			<DoubleColumnLayoutSidebar />
			<SidebarInset className="overflow-hidden min-w-0">
				<AppHeader />
				<AppContent />
			</SidebarInset>
		</SidebarProvider>
  );
};

export default DoubleColumnLayout;

