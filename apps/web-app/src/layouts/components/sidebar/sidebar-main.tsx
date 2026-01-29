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
} from "@rap/components-base/resizable-sidebar";
import type { MenuItem } from "@/layouts/hooks/useMenuService";
import { useState, useEffect } from "react";
import { cn } from "@rap/utils";
import { SidebarSearch } from "./sidebar-search";
import { MenuService } from "@/layouts/service/menuService";
import { useMenu } from "@/layouts/hooks/useMenu";
import { SidebarHighlightText } from "./sidebar-highlight-text";
import { SidebarBadge } from "./sidebar-badge";
import { ChevronRight } from "lucide-react";

interface SidebarMainProps {
	showSearch?: boolean;
	menus: MenuItem[]
}
export function SidebarMain({ showSearch = true, menus = [] }: SidebarMainProps) {
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
	toggleMenuOpen
} = props;
	const { children } = item;
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
							/>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
	)
}

interface MenuItemContentProps {
	item: MenuItem;
	searchKeywords?: string[];
}
function MenuItemContent({ item, searchKeywords = [] }: MenuItemContentProps) {
	const title = (
		<SidebarHighlightText
			key={item.id}
			text={item.title}
			searchKeywords={searchKeywords}
		/>
	);
	return (
		<span className="flex items-center size-full">
      {title}
      {item.badge && <SidebarBadge badge={item.badge} />}
		</span>
	)
}