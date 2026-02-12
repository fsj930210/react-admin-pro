import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarInset,
	SidebarProvider,
	useSidebar,
} from "@rap/components-base/sidebar";
import { Logo } from "@rap/components-ui/logo";
import { cn } from "@rap/utils";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { APP_BASE_PATH } from "@/config";
import { AppContent } from "@/layouts/components/content";
import { AppHeader } from "@/layouts/components/header";
import { MenuItemContent } from "@/layouts/components/menu/menu-item-content";
import { SidebarMain } from "@/layouts/components/sidebar/sidebar-main";
import { User } from "@/layouts/components/sidebar/sidebar-user";
import { useLayout } from "@/layouts/context/layout-context";
import { MenuService } from "@/layouts/service/menuService";
import type { MenuItem } from "@/layouts/types";

export function DoubleColumnLayout() {
	const navigate = useNavigate();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const { userMenus } = useLayout();
	const menuService = new MenuService(userMenus);
	const [selectedFistLevelMenu, setSelectedFistLevelMenu] = useState<MenuItem | null>(null);
	const isMenuItemClickRef = useRef(false);

	useEffect(() => {
		if (isMenuItemClickRef.current) {
			isMenuItemClickRef.current = false;
			return;
		}
		queueMicrotask(() => {
			const currentMenu = menuService.findMenuByUrl(pathname);
			if (currentMenu) {
				const ancestorMenus = menuService.findMenuAncestor(currentMenu.id);
				if (ancestorMenus.length > 0) {
					setSelectedFistLevelMenu(ancestorMenus[0]);
				}
			}
		});
	}, [pathname]);

	const handleMenuItemClick = (menu: MenuItem) => {
		isMenuItemClickRef.current = true;
		setSelectedFistLevelMenu(menu);
		if (menu.type === "menu") {
			navigate({ to: menu.url });
		} else if (menu.type === "dir") {
			const firstChildMenu = menuService.findFirstChildMenu(menu);
			if (firstChildMenu) {
				navigate({ to: firstChildMenu.url });
			}
		}
	};
	return (
		<SidebarProvider className="h-full">
			<DoubleColumnLayoutSidebar
				selectedFistLevelMenu={selectedFistLevelMenu}
				onMenuItemClick={handleMenuItemClick}
				userMenus={userMenus}
			/>
			<SidebarInset className="h-full min-h-auto overflow-hidden min-w-0">
				<AppHeader />
				<AppContent />
			</SidebarInset>
		</SidebarProvider>
	);
}

interface FirstLevelMenuProps {
	menus: MenuItem[];
	selectedItem?: MenuItem | null;
	onMenuItemClick?: (item: MenuItem) => void;
}
function FirstLevelMenu({ menus, selectedItem, onMenuItemClick }: FirstLevelMenuProps) {
	return (
		<div className="flex flex-col items-center py-2 w-25 h-full border-r">
			<Logo url={`${APP_BASE_PATH}/logo.svg`} showTitle={false} />
			<ol className="flex flex-col flex-1 w-full mt-2">
				{menus.map((item) => (
					<li
						key={item.id}
						className={cn(
							"flex-center h-16 cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground my-1 mx-2 p-0 text-sm whitespace-nowrap overflow-hidden rounded-md",
							selectedItem?.id === item.id
								? "bg-sidebar-accent text-sidebar-accent-foreground"
								: "",
						)}
						onClick={() => onMenuItemClick?.(item)}
					>
						<MenuItemContent
							item={item}
							searchKeywords={[]}
							showBadge={false}
							className="flex-col justify-center"
							iconSize={20}
						/>
					</li>
				))}
			</ol>
			<User />
		</div>
	);
}

interface DoubleColumnLayoutSidebarProps {
	selectedFistLevelMenu: MenuItem | null;
	userMenus: MenuItem[];
	onMenuItemClick: (menu: MenuItem) => void;
}

function DoubleColumnLayoutSidebar({
	selectedFistLevelMenu,
	onMenuItemClick,
	userMenus,
}: DoubleColumnLayoutSidebarProps) {
	const secondLevelMenus = selectedFistLevelMenu?.children ?? [];
	const { state, toggleSidebar } = useSidebar();
	return (
		<div className="flex">
			<FirstLevelMenu
				menus={userMenus || []}
				onMenuItemClick={onMenuItemClick}
				selectedItem={selectedFistLevelMenu}
			/>
			{secondLevelMenus.length > 0 && (
				<Sidebar collapsible="icon" className={`h-full left-25 flex-1 transition-all duration-300`}>
					<SidebarContent>
						<SidebarMain menus={secondLevelMenus} showSearch={false} />
					</SidebarContent>
					<SidebarFooter>
						<button
							className="flex-center size-6 rounded-xs cursor-pointer bg-muted"
							onClick={toggleSidebar}
						>
							{state === "collapsed" ? (
								<ChevronsRight className="size-4" />
							) : (
								<ChevronsLeft className="size-4" />
							)}
						</button>
					</SidebarFooter>
				</Sidebar>
			)}
		</div>
	);
}
