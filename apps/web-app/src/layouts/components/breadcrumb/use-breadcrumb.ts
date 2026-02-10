import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLayout } from "@/layouts/context/layout-context";
import type { BreadcrumbItem } from "./types";

function findFirstMenuInternal(menuItem: BreadcrumbItem): BreadcrumbItem | null {
	if (menuItem.children) {
		for (const child of menuItem.children) {
			if (child.type === "menu" && child.url) {
				return child;
			} else if (child.type === "dir" && child.children && child.children.length > 0) {
				const result = findFirstMenuInternal(child);
				if (result) {
					return result;
				}
			}
		}
	}
	return null;
}

export function useBreadcrumb() {
	const [breadcrumbList, setBreadcrumbList] = useState<BreadcrumbItem[]>([]);
	const { menuService } = useLayout();
	const navigate = useNavigate();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const handleBreadcrumbItemClick = (item: BreadcrumbItem) => {
		console.log(item);
		if (item.type === "dir") {
			const firstMenu = findFirstMenuInternal(item);
			if (firstMenu && firstMenu.url) {
				navigate({ to: firstMenu.url });
			}
		} else if (item.type === "menu") {
			navigate({ to: item.url });
		}
	};
	useEffect(() => {
		const selectedTab = menuService.findMenuByUrl(pathname);
		if (selectedTab) {
			const items = menuService.findMenuAncestor(selectedTab.id);
			queueMicrotask(() => {
				setBreadcrumbList(items);
			});
		}
	}, [pathname]);
	return {
		breadcrumbList,
		handleBreadcrumbItemClick,
	};
}
