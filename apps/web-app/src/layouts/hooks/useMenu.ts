import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { MenuService } from "../service/menuService";
import type { MenuItem } from "../types";

interface UseMenuServiceParams {
	menuService: MenuService;
	multiOpen?: boolean;
}
export function useMenu({ menuService, multiOpen = false }: UseMenuServiceParams) {
	const isMenuItemClickRef = useRef(false);
	const navigate = useNavigate();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
	const [openKeys, setOpenKeys] = useState<string[]>([]);

	const getOpenKeys = (selectedMenu: MenuItem | null): string[] => {
		if (!selectedMenu) return [];
		const openKeys: string[] = [];
		let current = selectedMenu;
		while (current && current.parentId) {
			const parent = menuService.flatMenus.find((menu) => menu.id === current.parentId);
			if (parent) {
				openKeys.push(parent.id);
				current = parent;
			} else {
				break;
			}
		}
		return openKeys;
	};
	const updateSelectedMenu = (menu: MenuItem | null) => {
		setSelectedMenu(menu);
	};

	const updateOpenKeysByMenu = (selectedMenu: MenuItem | null) => {
		const openKeys = getOpenKeys(selectedMenu);
		setOpenKeys(openKeys);
	};

	const toggleMenuOpen = (menuId: string) => {
		setOpenKeys((prevKeys) => {
			if (prevKeys.includes(menuId)) {
				return prevKeys.filter((key) => key !== menuId);
			} else {
				if (!multiOpen) {
					const menu = menuService.findMenuById(menuId);
					if (menu) {
						const siblingMenus = menuService.flatMenus.filter(
							(item) => item.parentId === menu.parentId,
						);
						const siblingMenuIds = siblingMenus.map((item) => item.id);
						return [...prevKeys.filter((key) => !siblingMenuIds.includes(key)), menuId];
					}
				}
				return [...prevKeys, menuId];
			}
		});
	};
	const handleMenuItemClick = (menuItem: MenuItem | null) => {
		if (!menuItem) return;
		if (menuItem.type === "dir") {
			toggleMenuOpen(menuItem.id);
			return;
		}
		if (menuItem.type === "menu" && menuItem.url) {
			if (menuItem.openMode === "newBrowserTab") {
				window.open(menuItem.url, "_blank");
			} else {
				navigate({ to: menuItem.url });
			}
			updateSelectedMenu(menuItem);
			isMenuItemClickRef.current = true;
		}
	};
	useEffect(() => {
		if (isMenuItemClickRef.current) {
			isMenuItemClickRef.current = false;
			return;
		}
		queueMicrotask(() => {
			const selectedMenu = menuService.findMenuByUrl(pathname);
			if (selectedMenu) {
				updateSelectedMenu(selectedMenu);
				updateOpenKeysByMenu(selectedMenu);
			}
		});
	}, [pathname]);
	return {
		updateOpenKeysByMenu,
		updateOpenKeys: setOpenKeys,
		updateSelectedMenu,
		handleMenuItemClick,
		toggleMenuOpen,
		selectedMenu,
		openKeys,
	};
}
