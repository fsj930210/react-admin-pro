import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarInset,
	SidebarProvider,
	useSidebar,
} from "@rap/components-base/sidebar";
import { cn } from "@rap/utils";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppLogo } from "@/components/app/logo";
import { AppContent } from "@/layouts/components/content";
import { AppHeader } from "@/layouts/components/header";
import { MenuItemContent } from "@/layouts/components/menu/menu-item-content";
import { SidebarMain } from "@/layouts/components/sidebar/sidebar-main";
import { User } from "@/layouts/components/sidebar/sidebar-user";
import { useLayout } from "@/layouts/context/layout-context";
import { MenuService } from "@/layouts/service/menuService";
import type { MenuItem } from "@/layouts/types";

export function MixDoubleColumnLayout() {
	const navigate = useNavigate();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const { userMenus } = useLayout();
	const menuService = new MenuService(userMenus);
	const [selectedFistLevelMenu, setSelectedFistLevelMenu] = useState<MenuItem | null>(null);
	const [selectedSecondLevelMenu, setSelectedSecondLevelMenu] = useState<MenuItem | null>(null);
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
					setSelectedSecondLevelMenu(ancestorMenus[1] || null);
				}
			}
		});
	}, [pathname]);
	const handleMenuItemClick = (menu: MenuItem) => {
		isMenuItemClickRef.current = true;
		const firstChildMenu = menuService.findFirstChildMenu(menu);
		if (firstChildMenu) {
			const ancestorMenus = menuService.findMenuAncestor(firstChildMenu.id);
			if (ancestorMenus.length > 0) {
				setSelectedFistLevelMenu(ancestorMenus[0]);
				setSelectedSecondLevelMenu(ancestorMenus[1] || null);
			}
		}
		if (menu.type === "menu") {
			navigate({ to: menu.url });
		} else if (menu.type === "dir") {
			navigate({ to: firstChildMenu?.url });
		}
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
							onMenuItemClick={handleMenuItemClick}
							selectedItem={selectedFistLevelMenu}
						/>
					</div>
				}
			/>
			<SidebarInset className="flex-row overflow-hidden min-w-0 flex-1">
				<DoubleColumnLayoutSidebar
					selectedFistLevelMenu={selectedFistLevelMenu}
					selectedSecondLevelMenu={selectedSecondLevelMenu}
					onMenuItemClick={handleMenuItemClick}
					menuService={menuService}
				/>
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

interface DoubleColumnLayoutSidebarProps {
	selectedFistLevelMenu: MenuItem | null;
	selectedSecondLevelMenu: MenuItem | null;
	onMenuItemClick: (menu: MenuItem) => void;
	menuService: MenuService;
}

function DoubleColumnLayoutSidebar({
	selectedFistLevelMenu,
	selectedSecondLevelMenu,
	onMenuItemClick,
}: DoubleColumnLayoutSidebarProps) {
	const secondLevelMenus = selectedFistLevelMenu?.children ?? [];
	const thirdLevelMenus = selectedSecondLevelMenu?.children ?? [];
	const { state, toggleSidebar } = useSidebar();
	if (secondLevelMenus.length === 0) {
		return null;
	}
	return (
		<div className="flex h-full">
			<SecondLevelMenu
				menus={secondLevelMenus}
				onMenuItemClick={onMenuItemClick}
				selectedItem={selectedSecondLevelMenu}
			/>
			{thirdLevelMenus.length > 0 && (
				<Sidebar collapsible="icon" className={`h-full left-25 flex-1 transition-all duration-300`}>
					<SidebarContent>
						<SidebarMain menus={thirdLevelMenus} showSearch={false} />
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

interface SecondLevelMenuProps {
	menus: MenuItem[];
	selectedItem?: MenuItem | null;
	onMenuItemClick?: (item: MenuItem) => void;
}

function SecondLevelMenu({ menus, selectedItem, onMenuItemClick }: SecondLevelMenuProps) {
	return (
		<div className="flex flex-col items-center py-2 w-25 h-full border-r">
			<ol className="flex flex-col flex-1 w-full mt-2">
				{menus.map((item) => (
					<li
						key={item.id}
						className={cn(
							"flex-center h-8 cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground my-1 mx-2 p-0 text-sm whitespace-nowrap overflow-hidden rounded-md",
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
							className="justify-center"
						/>
					</li>
				))}
			</ol>
			<User />
		</div>
	);
}
