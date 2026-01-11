import { createContext, use, useEffect, type ReactNode } from 'react';
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
	updateMenus: (menus: MenuItem[]) => void;
	searchMenus: (keyword: string) => MenuItem[];
	searchMenusWithExpand: (keyword: string) => { menus: MenuItem[]; expandKeys: string[] };
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export interface SidebarProviderProps {
	children: ReactNode;
	defaultMenus?: MenuItem[];
}

export function LayoutSidebarProvider({ children, defaultMenus = [] }: SidebarProviderProps) {
	const {
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
		updateMenus,
		searchMenus,
		searchMenusWithExpand,
	} = useMenuService({ defaultMenus });
	useEffect(() => {
		updateMenus(defaultMenus);
	}, [defaultMenus, updateMenus]);
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
		updateMenus,
		updateOpenKeys,
		updateOpenKeysByMenu,
		searchMenus,
		searchMenusWithExpand,
	};

	return (
		<SidebarContext value={contextValue}>
			{children}
		</SidebarContext>
	);
}

export function useSidebar() {
	const context = use(SidebarContext);
	if (context === undefined) {
		throw new Error('useSidebar must be used within a SidebarProvider');
	}
	return context;
}
