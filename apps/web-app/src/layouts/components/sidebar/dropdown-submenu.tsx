
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
	onOpenChange?: (open: boolean) => void;
}
export function DropdownSubmenu({
	item,
	searchKeywords = [],
	children,
	side = 'right',
	align = 'center',
	sideOffset = 8,
	onItemClick,
	onOpenChange,
 }: DropdownSubmenuProps) {
	const [open, setOpen] = useState(false);

  return (
		<DropdownMenu
			open={open}
			onOpenChange={(open) => {
				setOpen(open);
				onOpenChange?.(open);
			}}
		>
			<DropdownMenuTrigger
				onMouseEnter={() => {
					setOpen(true);
					onOpenChange?.(true);
				}}
				className="cursor-pointer"
			>
        {children}
			</DropdownMenuTrigger>
			{
				item.children?.length && (
					<DropdownMenuContent
						side={side}
						align={align}
						sideOffset={sideOffset}
					>
						{
							item.children?.map(child => (
								<DropdownSubmenuContent
									key={child.id}
									item={child}
									searchKeywords={searchKeywords}
									onItemClick={onItemClick}
								/>
							))
						}
					</DropdownMenuContent>
				)
			}
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

	if (item.hidden || item.type === 'button' || item.status !== 'enabled') return null;
	if (!children || !children.length) {
		return (
			<DropdownMenuItem onClick={() => onItemClick?.(item)}>
				<MenuItemContent item={item} searchKeywords={searchKeywords} />
			</DropdownMenuItem>
		)
	}

	return (
		<DropdownMenuSub >
			<DropdownMenuSubTrigger>
				<MenuItemContent item={item} searchKeywords={searchKeywords} />
			</DropdownMenuSubTrigger>
			<DropdownMenuPortal>
				<DropdownMenuSubContent sideOffset={sideOffset} >
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