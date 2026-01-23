import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@rap/components-base/collapsible";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@rap/components-base/resizable-sidebar";
import { SidebarContent } from "./sidebar-content";
import { useLayoutSidebar } from "./sidebar-context";
import { type MenuItem } from "@/layouts/hooks/useMenuService";
import { useState, useEffect } from "react";
import { cn } from "@rap/utils";
import { SidebarSearch } from "./sidebar-search";


interface MenuItemComponentProps {
  item: MenuItem;
  level?: number;
	searchKeywords: string[];
}

function MenuItemComponent({ 
  item, 
  level = 0, 
 
	searchKeywords,
}: MenuItemComponentProps) {
	const {
		selectedMenu, 
		openKeys,
		toggleMenuOpen ,
	} = useLayoutSidebar();
  const hasChildren = (item.children?.length ?? 0) > 0;
  const isActive = selectedMenu?.id === item.id;
  const isOpen = openKeys.includes(item.id);
  const isSubItem = level > 0;


  // 顶级菜单项
  if (level === 0) {
    return (
      <Collapsible 
				key={item.id} 
				open={isOpen} 
				onOpenChange={() => toggleMenuOpen(item.id)}
			>
        <SidebarMenuItem className="px-0 my-1 mx-2">
          <CollapsibleTrigger asChild>
            <SidebarContent
              item={item}
              isActive={isActive}
              hasChildren={hasChildren}
              isOpen={isOpen}
              isSubItem={isSubItem}
              level={level}
							searchKeywords={searchKeywords}
            />
          </CollapsibleTrigger>
				</SidebarMenuItem>
          {hasChildren && (
            <CollapsibleContent>
              <SidebarMenuSub className="border-none mx-0 px-0">
                {item.children?.map((child) => (
                  <MenuItemComponent
                    key={child.id}
                    item={child}
                    level={level + 1}
										searchKeywords={searchKeywords}
                  />
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          )}
      </Collapsible>
    );
  }

  // 子菜单项（第二级及以后）
  return (
    <Collapsible open={isOpen} onOpenChange={() => toggleMenuOpen(item.id)}>
    	<SidebarMenuSubItem key={item.id} className={cn("my-1 mx-2")}>
        <CollapsibleTrigger asChild>
					<SidebarContent
						item={item}
						isActive={isActive}
						hasChildren={hasChildren}
						isOpen={isOpen}
						isSubItem={isSubItem}
						level={level}
						searchKeywords={searchKeywords}
					/>
        </CollapsibleTrigger>
			</SidebarMenuSubItem>
			{
				hasChildren ? (
					<CollapsibleContent>
            <SidebarMenuSub className="border-none mx-0 px-0">
              {item.children?.map((child) => (
                <MenuItemComponent
                  key={child.id}
                  item={child}
                  level={level + 1}
									searchKeywords={searchKeywords}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
				) : null
			}
    </Collapsible>
  )
}

interface SidebarMainProps {
	showSearch?: boolean;
}
export function SidebarMain({ showSearch = true }: SidebarMainProps) {
  const { 
		menus, 
		searchMenusReturnTree,
		updateOpenKeys
	} = useLayoutSidebar();

	const [displayMenus, setDisplayMenus] = useState(menus);
	const [searchKeywords, setSearchKeywords] = useState<string[]>([]);

	const handleInputChange = (value: string) => {
		if (value) {
			const { expandKeys, menus, searchKeywords } = searchMenusReturnTree(value);
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
    <SidebarMenu className="overflow-x-hidden">
			{
				showSearch && (
					<SidebarSearch onChange={handleInputChange} />
				)
			}
      {displayMenus.map((item: MenuItem) => (
        <MenuItemComponent
          key={item.id}
          item={item}
          level={0}
					searchKeywords={searchKeywords}
        />
      ))}
    </SidebarMenu>
  );
}
