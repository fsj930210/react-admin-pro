import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarInset,
	SidebarProvider,
	SidebarRail,
	useSidebar,
} from "@rap/components-base/sidebar/index";
import { cn } from "@rap/utils";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppLogo } from "@/components/app/logo";
import { AppContent } from "@/layouts/components/content";
import { AppHeader } from "@/layouts/components/header";
import { MenuItemContent } from "@/layouts/components/menu/menu-item-content";
import { SidebarMain } from "@/layouts/components/sidebar/sidebar-main";
import { useLayout } from "@/layouts/context/layout-context";
import { MenuService } from "@/layouts/service/menuService";
import type { MenuItem } from "@/layouts/types";

export function MixVerticalLayout() {
	const navigate = useNavigate();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const { userMenus } = useLayout();
	const menuService = new MenuService(userMenus);
	const [selectedFistLevelMenu, setSelectedFistLevelMenu] = useState<MenuItem | null>(null);
	const secondLevelMenus = selectedFistLevelMenu?.children ?? [];
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

	const handleHorizontalMenuItemClick = (menu: MenuItem) => {
		handleMenuItemClick(menu);
	};
	return (
		<SidebarProvider className="flex flex-col h-full min-h-auto overflow-hidden">
			<AppHeader
				className="border-b"
				rightFeatures={[
					"globalSearch",
					"themeSwitch",
					"i18n",
					"fullscreen",
					"reload",
					"notify",
					"userCenter",
				]}
				leftRender={
					<div className="flex items-center w-full">
						<div className="mr-6">
							<AppLogo />
						</div>
						<HorizontalMenu
							className="flex-1"
							menus={userMenus || []}
							onMenuItemClick={handleHorizontalMenuItemClick}
							selectedItem={selectedFistLevelMenu}
						/>
					</div>
				}
			/>
			<SidebarInset className="flex-row overflow-hidden min-h-auto h-[calc(100%-var(--spacing)*11)]">
				<MixVerticalLayoutSidebar menus={secondLevelMenus} />
				<AppContent />
			</SidebarInset>
		</SidebarProvider>
	);
}

interface HorizontalMenuProps {
	menus: MenuItem[];
	className?: string;
	selectedItem?: MenuItem | null;
	onMenuItemClick?: (menu: MenuItem) => void;
}

function HorizontalMenu({ menus, onMenuItemClick, className, selectedItem }: HorizontalMenuProps) {
	return (
		<nav className={cn("flex items-center gap-1", className)}>
			{menus.map((item) => (
				<div
					key={item.id}
					className={cn(
						"flex-center h-full cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground my-1 mx-2 p-2 text-sm whitespace-nowrap overflow-hidden rounded-md",
						selectedItem?.id === item.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "",
					)}
					onClick={() => onMenuItemClick?.(item)}
				>
					<MenuItemContent
						item={item}
						searchKeywords={[]}
						showBadge={false}
						className="justify-center"
					/>
				</div>
			))}
		</nav>
	);
}

interface MixVerticalLayoutSidebarProps {
	menus: MenuItem[];
}
function MixVerticalLayoutSidebar({ menus }: MixVerticalLayoutSidebarProps) {
	const { state, toggleSidebar } = useSidebar();
	return menus.length > 0 ? (
		<Sidebar
			collapsible="icon"
			className={`h-[calc(100%-var(--spacing)*11)] top-11 flex-1 transition-all duration-300`}
		>
			<SidebarContent>
				<SidebarMain menus={menus} showSearch={false} />
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
			<SidebarRail />
		</Sidebar>
	) : null;
}
