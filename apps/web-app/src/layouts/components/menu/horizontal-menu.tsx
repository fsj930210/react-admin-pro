import type { MenuItem } from "@/layouts/hooks/useMenuService";
import { SidebarHoverSubmenu } from "./sidebar/sidebar-hover-submenu";
import { LayoutSidebarProvider } from "./sidebar/sidebar-context";

interface HorizontalMenuProps {
  menus: MenuItem[];
  selectedMenu?: MenuItem | null;
  onMenuItemClick: (menu: MenuItem) => void;
  className?: string;
}

export function HorizontalMenu({ 
  menus, 
  selectedMenu,
  className,
  onMenuItemClick,
}: HorizontalMenuProps) {
  const renderMenuItem = (menu: MenuItem) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isSelected = selectedMenu?.id === menu.id;

    if (hasChildren) {
      return (
        <div key={menu.id} className="relative inline-flex items-center mx-1">
          <SidebarHoverSubmenu item={menu} orientation="horizontal" />
        </div>
      );
    } else {
      return (
        <button
          key={menu.id}
          className={`px-3 py-2 text-sm font-medium ${isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
          onClick={() => onMenuItemClick(menu)}
        >
          {menu.title}
        </button>
      );
    }
  };

  return (
    <LayoutSidebarProvider menus={menus}>
      <div className={`flex items-center ${className ?? ''}`}>
        {menus.map(menu => renderMenuItem(menu))}
      </div>
    </LayoutSidebarProvider>
  );
}