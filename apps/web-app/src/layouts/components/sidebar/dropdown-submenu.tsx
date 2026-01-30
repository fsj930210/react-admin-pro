
import type { MenuItem } from "@/layouts/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@rap/components-base/dropdown-menu"
import { useState, type ReactNode } from "react";
import { MenuItemContent } from "./menu-item-content";

interface DropdownSubmenuProps {
  item: MenuItem;
  searchKeywords?: string[];
	children?: ReactNode;
	side?: 'left' | 'right' | 'bottom' | 'top';
	align?: 'start' | 'end' | 'center';
	sideOffset?: number;
	onItemClick?: (item: MenuItem) => void;
}
export function DropdownSubmenu({ 
	item, 
	searchKeywords = [], 
	children, 
	side = 'right', 
	align = 'center', 
	sideOffset = 8,
	onItemClick,
 }: DropdownSubmenuProps) {
	const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger onMouseEnter={() => setOpen(true)}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
				side={side} 
				align={align}
				sideOffset={sideOffset} 
				onMouseLeave={() => setOpen(false)}
			>
				<DropdownSubmenuContent
					item={item}
					searchKeywords={searchKeywords}
					onItemClick={onItemClick}
				/>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DropdownSubmenuContent({ 
	item, 
	searchKeywords = [], 
	sideOffset = 8,
	onItemClick,
}: DropdownSubmenuProps) {
	const { children } = item;

	if (item.hidden) return null;
	if (!children || !children.length) {
		return (
			<DropdownMenuItem onClick={() => onItemClick?.(item)}>
				<MenuItemContent item={item} searchKeywords={searchKeywords} />
			</DropdownMenuItem>
		)
	}

	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>
				<MenuItemContent item={item} searchKeywords={searchKeywords} />
			</DropdownMenuSubTrigger>
			<DropdownMenuPortal>
				<DropdownMenuSubContent sideOffset={sideOffset}>
					{item.children?.map(child => (
						<DropdownSubmenuContent
							key={child.id}
							item={child}
							searchKeywords={searchKeywords}
							onItemClick={onItemClick}
						/>
					))}
				</DropdownMenuSubContent>
			</DropdownMenuPortal>
		</DropdownMenuSub>
	)
}