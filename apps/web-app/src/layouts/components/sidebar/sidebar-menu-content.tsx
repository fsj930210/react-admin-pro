import {
  SidebarMenuButton,
  SidebarMenuSubButton,
} from "@rap/components-base/resizable-sidebar";
import { ChevronRight } from "lucide-react";
import type { MenuItem } from "@/layouts/hooks/useMenuService";

interface SidebarMenuContentProps {
  item: MenuItem;
  isActive: boolean;
  hasChildren: boolean;
  isOpen: boolean;
  onMenuItemClick: (item: MenuItem | null) => void;
  isSubItem?: boolean;
}

export function SidebarMenuContent({ 
  item, 
  isActive, 
  hasChildren, 
  isOpen, 
  onMenuItemClick,
  isSubItem = false 
}: SidebarMenuContentProps) {
  const ButtonComponent = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;
  
  return (
    <ButtonComponent
      isActive={isActive}
      tooltip={isSubItem ? undefined : item.title}
      className="cursor-pointer"
      onClick={() => onMenuItemClick(item)}
    >
      {item.icon && <item.icon />}
      <span>{item.title}</span>
      
      {/* 展开/折叠图标 - 只有有子菜单的项才显示 */}
      {hasChildren && (
        <ChevronRight 
          className={`ml-auto transition-transform duration-100 ${isOpen ? 'rotate-90' : ''}`} 
        />
      )}
    </ButtonComponent>
  );
}
