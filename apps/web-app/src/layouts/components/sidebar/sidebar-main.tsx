import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@rap/components-base/collapsible";
import {
	SidebarInput,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
	useSidebar as useBaseSidebar,
} from "@rap/components-base/resizable-sidebar";
import { SidebarMenuContent } from "./sidebar-menu-content";
import { useSidebar } from "./sidebar-context";
import { useNavigate } from "@tanstack/react-router";
import { type MenuItem } from "@/layouts/hooks/useMenuService";
import { Search } from "lucide-react";
import { useRef } from "react";
import { cn } from "@rap/utils";

interface MenuItemComponentProps {
  item: MenuItem;
  level?: number;
  selectedMenu?: MenuItem | null;
  openKeys: string[];
  onMenuClick?: (item: MenuItem) => void;
  onOpenChange: (menuId: string) => void;
	updateSelectedMenu: (item: MenuItem | null) => void;
}

function MenuItemComponent({ 
  item, 
  level = 0, 
  selectedMenu, 
  openKeys,
  onMenuClick, 
  onOpenChange,
  updateSelectedMenu
}: MenuItemComponentProps) {
  const hasChildren = (item.children?.length ?? 0) > 0;
  const isActive = selectedMenu?.id === item.id;
  const isOpen = openKeys.includes(item.id);
  const isSubItem = level > 0;
  const navigate = useNavigate();
  const handleMenuItemClick = (item: MenuItem | null) => {
		if (!item) return;
    if (hasChildren && item.type === 'dir') {
      onOpenChange(item.id);
    } else if (item.type === 'menu' && item.url) {
			updateSelectedMenu?.(item);
			switch (item.openMode) {
				case 'currentSystemTab':
					navigate({ to: item.url });
					break;
				case 'newSystemTab':
					navigate({ to: item.url });
					break;
				case 'newBrowserTab':
					window.open(item.url, '_blank');
					break;
				case 'iframe':
					navigate({ to: item.url });
					break;
				default:
					navigate({ to: item.url });
					break;
			}
		}
		onMenuClick?.(item);
  };

  // 顶级菜单项
  if (level === 0) {
    return (
      <Collapsible 
				key={item.id} 
				open={isOpen} 
				onOpenChange={() => onOpenChange(item.id)}
			>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuContent
              item={item}
              isActive={isActive}
              hasChildren={hasChildren}
              isOpen={isOpen}
              onMenuItemClick={handleMenuItemClick}
              isSubItem={isSubItem}
            />
          </CollapsibleTrigger>
          {hasChildren && (
            <CollapsibleContent>
              <SidebarMenuSub className="mx-0">
                {item.children?.map((child) => (
                  <MenuItemComponent
                    key={child.id}
                    item={child}
                    level={level + 1}
                    selectedMenu={selectedMenu}
                    openKeys={openKeys}
                    onMenuClick={onMenuClick}
                    onOpenChange={onOpenChange}
                    updateSelectedMenu={updateSelectedMenu}
                  />
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          )}
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  // 子菜单项（第二级及以后）
  return (
    <SidebarMenuSubItem key={item.id}>
      {hasChildren ? (
        <Collapsible open={isOpen} onOpenChange={() => onOpenChange(item.id)}>
          <CollapsibleTrigger asChild>
            <SidebarMenuContent
              item={item}
              isActive={isActive}
              hasChildren={hasChildren}
              isOpen={isOpen}
              onMenuItemClick={handleMenuItemClick}
              isSubItem={isSubItem}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="mx-0">
              {item.children?.map((child) => (
                <MenuItemComponent
                  key={child.id}
                  item={child}
                  level={level + 1}
                  selectedMenu={selectedMenu}
                  openKeys={openKeys}
                  onMenuClick={onMenuClick}
                  onOpenChange={onOpenChange}
									updateSelectedMenu={updateSelectedMenu}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        // 如果没有子菜单，直接渲染按钮
        <SidebarMenuContent
          item={item}
          isActive={isActive}
          hasChildren={hasChildren}
          isOpen={isOpen}
          onMenuItemClick={handleMenuItemClick}
          isSubItem={isSubItem}
        />
      )}
    </SidebarMenuSubItem>
  );
}

interface SidebarMainProps {
	showSearch?: boolean;
}
export function SidebarMain({ showSearch = true }: SidebarMainProps) {
  const { 
		menus, 
		selectedMenu, 
		openKeys,
		toggleMenuOpen ,
		updateSelectedMenu
	} = useSidebar();
	const searchRef = useRef<HTMLInputElement>(null);
	const { state, toggleSidebar } = useBaseSidebar()

  return (
    <SidebarMenu>
			{
				showSearch ? (
					<div className=" flex-center p-2">
						<SidebarInput 
							placeholder="搜索菜单" 
							ref={searchRef}
							className={cn("w-full", state === 'collapsed' ? 'hidden' : '')}
						/>
						<Search 
							className={cn("size-5 cursor-pointer", state === 'expanded' ? 'hidden' : '')} 
							onClick={() => {
								toggleSidebar();
								searchRef.current?.focus?.();
							}} 
						/>
					</div>
				) : null
			}

      {menus.map((item: MenuItem) => (
        <MenuItemComponent
          key={item.id}
          item={item}
          level={0}
          selectedMenu={selectedMenu}
          openKeys={openKeys}
          onOpenChange={toggleMenuOpen}
          updateSelectedMenu={updateSelectedMenu}
        />
      ))}
    </SidebarMenu>
  );
}
