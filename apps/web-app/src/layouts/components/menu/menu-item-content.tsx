import { cn } from "@rap/utils";
import type { MenuItem } from "@/layouts/types";
import { MenuItemBadge } from "./menu-item-badge";
import { MenuItemHighlightText } from "./menu-item-highlight-text";
import Icon from "@rap/components-ui/icon";

interface MenuItemContentProps {
	item: MenuItem;
	searchKeywords?: string[];
	showBadge?: boolean;
	className?: string;
	iconSize?: number;
}
export function MenuItemContent({
	item,
	searchKeywords = [],
	showBadge = true,
	className,
	iconSize = 16,
}: MenuItemContentProps) {
	return (
		<span className={cn("flex items-center size-full gap-1", className)}>
			{item.icon && <Icon icon={item.icon} size={iconSize} />}
			<MenuItemHighlightText key={item.id} text={item.title} searchKeywords={searchKeywords} />
			{showBadge && item.badge && <MenuItemBadge badge={item.badge} />}
		</span>
	);
}
