import type { MenuItem } from "@/layouts/types";
import { MenuItemHighlightText } from "./menu-item-highlight-text";
import { MenuItemBadge } from "./menu-item-badge";

interface MenuItemContentProps {
	item: MenuItem;
	searchKeywords?: string[];
	showBadge?: boolean;
}
export function MenuItemContent({ item, searchKeywords = [], showBadge = true }: MenuItemContentProps) {
	return (
		<span className="flex items-center size-full">
			<MenuItemHighlightText
				key={item.id}
				text={item.title}
				searchKeywords={searchKeywords}
			/>
			{showBadge && item.badge && <MenuItemBadge badge={item.badge} />}
		</span>
	)
}