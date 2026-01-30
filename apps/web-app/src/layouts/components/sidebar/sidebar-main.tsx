import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@rap/components-base/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  useSidebar,
} from "@rap/components-base/resizable-sidebar";
import type { MenuItem } from "@/layouts/hooks/useMenuService";
import { useState, useEffect } from "react";
import { cn } from "@rap/utils";
import { SidebarSearch } from "./sidebar-search";
import { MenuService } from "@/layouts/service/menuService";
import { useMenu } from "@/layouts/hooks/useMenu";
import { ChevronRight } from "lucide-react";
import { MenuItemContent } from "./menu-item-content";
import { DropdownSubmenu } from "./dropdown-submenu";

interface SidebarMainProps {
	showSearch?: boolean;
	menus: MenuItem[];
	disableCollapsedDropdown?: boolean;
	collapsedDropdownTrigger?: ('hover' | 'click')[];
}
export function SidebarMain({ 
	showSearch = true, 
	menus = [],
	disableCollapsedDropdown = false,
}: SidebarMainProps) {
	const menuService = new MenuService(menus);
	const { 
		openKeys, 
		selectedMenu,
		updateOpenKeys, 
		handleMenuItemClick,
		toggleMenuOpen
	} = useMenu({ menuService })
	const [displayMenus, setDisplayMenus] = useState(menus);
	const [searchKeywords, setSearchKeywords] = useState<string[]>([]);

	const handleInputChange = (value: string) => {
		if (value) {
			const { expandKeys, menus, searchKeywords } = menuService.searchMenus(value).menuTree;
			updateOpenKeys(expandKeys);
			setDisplayMenus(menus);
			setSearchKeywords(searchKeywords);
		} else {
			setDisplayMenus(menus);
			setSearchKeywords([]);
		}
	};
	useEffect(() => {
		// eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
		setDisplayMenus(menus);
	}, [menus])

  return (
    <SidebarMenu className="overflow-x-hidden h-full">
		{
			showSearch && (
				<SidebarSearch onChange={handleInputChange} />
			)
		}
      {displayMenus.map((item: MenuItem) => (
        <SidebarMenuItemContent
          key={item.id}
          item={item}
					searchKeywords={searchKeywords}
					openKeys={openKeys}
					selectedMenu={selectedMenu}
					toggleMenuOpen={toggleMenuOpen}
					onItemClick={handleMenuItemClick}
					level={0}
					disableCollapsedDropdown={disableCollapsedDropdown}
        />
      ))}
    </SidebarMenu>
  );
}

interface SidebarMenuItemContentProps {
  item: MenuItem;
	searchKeywords?: string[];
	selectedMenu: MenuItem | null;
	openKeys: string[];
	level: number;
	disableCollapsedDropdown?: boolean;
	toggleMenuOpen: (id: string) => void;
	onItemClick?: (item: MenuItem) => void;
}

function SidebarMenuItemContent (props: SidebarMenuItemContentProps) {
	const { 
	item, 
	selectedMenu,
	searchKeywords,
	openKeys,
	level = 0,
	onItemClick,
	toggleMenuOpen,
	disableCollapsedDropdown = false,
} = props;
	const { children } = item;
	const { state: sidebarState } = useSidebar();
	const isCollapsed = sidebarState === 'collapsed';

	if (item.hidden) return null;
	if (!children || !children.length) {
		return (
			<SidebarMenuItem className={cn("px-0 my-1 mx-2", { "mx-0": level > 0 } )}>
				<SidebarMenuButton
					isActive={selectedMenu?.id === item.id}
					onClick={() => onItemClick?.(item)}
					className="flex items-center justify-between p-0 pr-1 cursor-pointer whitespace-nowrap" 
					style={{
						paddingLeft: `calc(var(--spacing) * 4 + var(--spacing) * 4 * ${level})`,
					}}
				>
					<MenuItemContent 
						item={item} 
						searchKeywords={searchKeywords} 
					/>
				</SidebarMenuButton>
			</SidebarMenuItem>
		)
	}

	if (isCollapsed && !disableCollapsedDropdown) {
		return (
			<SidebarMenuItem className="px-0 my-1 mx-2">
				<DropdownSubmenu 
					item={item} 
					searchKeywords={searchKeywords} 
					onItemClick={onItemClick}
				>
					<SidebarMenuButton
						isActive={selectedMenu?.id === item.id}
						className="flex items-center justify-center p-0"
					>
						<MenuItemContent 
							item={item} 
							searchKeywords={searchKeywords} 
						/>
					</SidebarMenuButton>
				</DropdownSubmenu>
			</SidebarMenuItem>
		)
	}

	return (
		<SidebarMenuItem className={cn("px-0 my-1 mx-2", { "mx-0": level > 0 })}>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:last-child]:rotate-90"
				onOpenChange={() => toggleMenuOpen(item.id)}
				open={openKeys.includes(item.id)}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton 
						className="flex items-center justify-between p-0 pr-1 cursor-pointer whitespace-nowrap" 
						style={{
							paddingLeft: `calc(var(--spacing) * 4 + var(--spacing) * 4 * ${level})`,
						}}
					>
						<MenuItemContent 
							item={item} 
							searchKeywords={searchKeywords} 
						/>
            <ChevronRight className="size-4 transition-transform duration-200 ease-in-out" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="border-none mx-0 px-0">
            {children.map((subItem) => (
              <SidebarMenuItemContent
								key={subItem.id}
								{...props}
								level={level + 1}
								item={subItem}
								disableCollapsedDropdown={disableCollapsedDropdown}
							/>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
	)
}
