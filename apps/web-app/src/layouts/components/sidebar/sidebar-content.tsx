import { SidebarMenuButton, SidebarMenuSubButton } from "@rap/components-base/resizable-sidebar";
import { ChevronRight } from "lucide-react";
import type { MenuItem } from "@/layouts/hooks/useMenuService";
import { SidebarBadge } from "./sidebar-badge";
import { SidebarHighlightText } from "./sidebar-highlight-text";
import { useSidebar } from "@rap/components-base/resizable-sidebar";
import { SidebarHoverSubmenu } from "./sidebar-hover-submenu";

interface SidebarMenuContentProps {
  item: MenuItem;
  isActive: boolean;
  hasChildren: boolean;
  isOpen: boolean;
  isSubItem?: boolean;
  level?: number;
  searchKeywords?: string[];
	onItemClick?: (item: MenuItem) => void;
}

export function SidebarContent({ 
  item, 
  isActive, 
  hasChildren, 
  isOpen, 
  isSubItem = false,
  level = 0,
  searchKeywords = [],
	onItemClick
}: SidebarMenuContentProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const ButtonComponent = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;
  const title = (
    <SidebarHighlightText
      key={item.id}
      text={item.title}
      searchKeywords={searchKeywords}
    />
  );
  
  if (isCollapsed && hasChildren && level === 0) {
    return (
      <SidebarHoverSubmenu 
        item={item} 
        level={level} 
        searchKeywords={searchKeywords}
      />
    );
  }
  
  return (
    <ButtonComponent
      isActive={isActive}
      tooltip={isSubItem ? undefined : item.title}
      className="cursor-pointer flex items-center whitespace-nowrap"
      onClick={() => onItemClick?.(item)}
      style={{
        paddingLeft: `calc(var(--spacing) * 4 + var(--spacing) * 4 * ${level})`,
      }}
    >
      {item.icon && <item.icon />}
      {title}
      {item.badge && <SidebarBadge badge={item.badge} />}
      {hasChildren && (
        <ChevronRight 
          className={`ml-auto transition-transform size-4 duration-200 ease-in-out  ${isOpen ? 'rotate-90' : ''}`} 
        />
      )}
    </ButtonComponent>
  );
}
