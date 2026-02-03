import type { MenuItem } from "@/layouts/types";
import { MenuItemHighlightText } from "./menu-item-highlight-text";
import { MenuItemBadge } from "./menu-item-badge";
import { cn } from "@rap/utils";

interface MenuItemContentProps {
	item: MenuItem;
	searchKeywords?: string[];
	showBadge?: boolean;
	className?: string;
}
export function MenuItemContent({ item, searchKeywords = [], showBadge = true, className }: MenuItemContentProps) {
	return (
		<span className={cn("flex items-center size-full", className)}>
			<MenuItemHighlightText
				key={item.id}
				text={item.title}
				searchKeywords={searchKeywords}
			/>
			{showBadge && item.badge && <MenuItemBadge badge={item.badge} />}
		</span>
	)
}