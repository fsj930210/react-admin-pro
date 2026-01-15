import { createContext, use, useEffect, type ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useMenuService, type MenuItem } from '../../hooks/useMenuService';

export interface SidebarContextValue {

	menus: MenuItem[];
	flatMenus: MenuItem[];
	selectedMenu: MenuItem | null;
	openKeys: string[];
	toggleMenuOpen: (id: string) => void;
	findMenuAncestor: (id: string) => MenuItem[];
	findMenuById: (id: string) => MenuItem | null;
	findMenuByUrl: (url: string) => MenuItem | null;
	updateSelectedMenu: (menus: MenuItem | null) => void;
	updateOpenKeys: (ids: string[]) => void;
	updateOpenKeysByMenu: (selectedMenu: MenuItem | null) => void;
	searchMenusReturnList: (keyword: string) => { menus: MenuItem[]; searchKeywords: string[] };
	searchMenusReturnTree: (keyword: string) => { menus: MenuItem[]; expandKeys: string[], searchKeywords: string[] };
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export interface SidebarProviderProps {
	children: ReactNode;
	menus?: MenuItem[];
}

export function LayoutSidebarProvider({ children, menus = [] }: SidebarProviderProps) {
	const {
		flatMenus,
		selectedMenu,
		openKeys,
		findMenuAncestor,
		findMenuById,
		findMenuByUrl,
		toggleMenuOpen,
		updateSelectedMenu,
		updateOpenKeys,
		updateOpenKeysByMenu,
		searchMenusReturnList,
		searchMenusReturnTree,
	} = useMenuService({ menus });
	

	const pathname = useLocation({
		select: (location) => location.pathname,
	});

	
	useEffect(() => {
		const menu = findMenuByUrl(pathname);
		if (menu) {
			updateSelectedMenu(menu);
			updateOpenKeysByMenu(menu);
		}
	}, [menus]);
	
	const contextValue: SidebarContextValue = {
		menus,
		flatMenus,
		selectedMenu,
		openKeys,
		findMenuAncestor,
		findMenuById,
		findMenuByUrl,
		toggleMenuOpen,
		updateSelectedMenu,
		updateOpenKeys,
		updateOpenKeysByMenu,
		searchMenusReturnList,
		searchMenusReturnTree,
	};

	return (
		<SidebarContext value={contextValue}>
			{children}
		</SidebarContext>
	);
}

export function useLayoutSidebar() {
	const context = use(SidebarContext);
	if (context === undefined) {
		throw new Error('useSidebar must be used within a SidebarProvider');
	}
	return context;
}
