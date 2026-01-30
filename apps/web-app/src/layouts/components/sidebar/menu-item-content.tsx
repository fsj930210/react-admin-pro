import type { MenuItem } from "@/layouts/types";
import { SidebarHighlightText } from "./sidebar-highlight-text";
import { SidebarBadge } from "./sidebar-badge";

interface MenuItemContentProps {
	item: MenuItem;
	searchKeywords?: string[];
}
export function MenuItemContent({ item, searchKeywords = [] }: MenuItemContentProps) {
	return (
		<span className="flex items-center size-full">
			<SidebarHighlightText
				key={item.id}
				text={item.title}
				searchKeywords={searchKeywords}
			/>
			{item.badge && <SidebarBadge badge={item.badge} />}
		</span>
	)
}