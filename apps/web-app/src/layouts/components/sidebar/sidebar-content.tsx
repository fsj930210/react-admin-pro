import { SidebarMenuButton, SidebarMenuSubButton,} from "@rap/components-base/resizable-sidebar";
import { ChevronRight } from "lucide-react";
import type { MenuItem } from "@/layouts/hooks/useMenuService";
import { SidebarBadge } from "./sidebar-badge";
import { SidebarHighlightText } from "./sidebar-highlight-text";
import { useLayoutSidebar } from "./sidebar-context";

interface SidebarMenuContentProps {
  item: MenuItem;
  isActive: boolean;
  hasChildren: boolean;
  isOpen: boolean;
  isSubItem?: boolean;
  level?: number;
	searchKeywords?: string[];

}

export function SidebarContent({ 
  item, 
  isActive, 
  hasChildren, 
  isOpen, 
  isSubItem = false,
  level = 0,
	searchKeywords = [],
}: SidebarMenuContentProps) {
	const { handleMenuItemClick } = useLayoutSidebar();
  const ButtonComponent = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;
  const title = (
    <SidebarHighlightText
      key={item.id}
      text={item.title}
      searchKeywords={searchKeywords}
    />
  );
  return (
    <ButtonComponent
      isActive={isActive}
      tooltip={isSubItem ? undefined : item.title}
      className="cursor-pointer flex items-center whitespace-nowrap"
      onClick={() => handleMenuItemClick?.(item)}
			style={{
				paddingLeft: `calc(var(--spacing) * 4 + var(--spacing) * 4 * ${level})`,
			}}
    >
      {/* {item.icon && <item.icon />} */}
      {title}
      {item.badge && <SidebarBadge badge={item.badge} />}
      {hasChildren && (
        <ChevronRight 
          className={`ml-auto transition-transform size-4 duration-100 ${isOpen ? 'rotate-90' : ''}`} 
        />
      )}
    </ButtonComponent>
  );
}
