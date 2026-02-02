
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
	open?: boolean;
	showBadge?: boolean;
	onItemClick?: (item: MenuItem) => void;
	onOpenChange?: (open: boolean, item: MenuItem) => void;
}
export function DropdownSubmenu({
	item,
	searchKeywords = [],
	children,
	side = 'right',
	align = 'center',
	sideOffset = 4,
	open: propOpen,
	showBadge = true,
	onItemClick,
	onOpenChange,
 }: DropdownSubmenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = propOpen !== undefined;
  const isOpen = isControlled ? propOpen : internalOpen;
  
  const handleOpenChange = (open: boolean) => {
		if (isControlled) {
			onOpenChange?.(open, item);
		} else {
			setInternalOpen(open);
		}
  };
  
  return (
		<div 
			className="relative"
			onMouseLeave={() => handleOpenChange(false)}
		>
			<DropdownMenu
				open={isOpen}
				onOpenChange={handleOpenChange}
			>
				<DropdownMenuTrigger 
					className="cursor-pointer"
					onMouseEnter={() => handleOpenChange(true)}
					onMouseLeave={() => handleOpenChange(false)}
				>
					{children}
				</DropdownMenuTrigger>
				{
					item.children?.length && (
						<DropdownMenuContent
							side={side}
							align={align}
							sideOffset={sideOffset}
							className="border-border bg-background shadow-lg dropdown-menu-content min-w-50"
							onMouseEnter={() => handleOpenChange(true)}
							onMouseLeave={() => handleOpenChange(false)}
						>
							{
								item.children?.map(child => (
									<DropdownSubmenuContent
										key={child.id}
										item={child}
										searchKeywords={searchKeywords}
										onItemClick={onItemClick}
										showBadge={showBadge}
									/>
								))
							}
						</DropdownMenuContent>
					)
				}
			</DropdownMenu>
		</div>
  )
}

function DropdownSubmenuContent({ 
	item,
	searchKeywords = [],
	sideOffset = 8,
	showBadge = true,
	onItemClick,
}: DropdownSubmenuProps) {
	const { children } = item;
	if (item.hidden || item.type === 'button' || item.status !== 'enabled') return null;
	if (!children || !children.length) {
		return (
			<DropdownMenuItem onClick={() => onItemClick?.(item)}>
				<MenuItemContent 
					item={item} 
					searchKeywords={searchKeywords} 
					showBadge={showBadge} 
				/>
			</DropdownMenuItem>
		)
	}

	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger className="cursor-pointer">
				<MenuItemContent item={item} searchKeywords={searchKeywords} />
			</DropdownMenuSubTrigger>
			<DropdownMenuPortal>
				<DropdownMenuSubContent 
					sideOffset={sideOffset}
					className="min-w-50 dropdown-menu-content"
				>
					{item.children?.map(child => (
						<DropdownSubmenuContent
							key={child.id}
							item={child}
							searchKeywords={searchKeywords}
							onItemClick={onItemClick}
							showBadge={showBadge}
						/>
					))}
				</DropdownMenuSubContent>
			</DropdownMenuPortal>
		</DropdownMenuSub>
	)
}