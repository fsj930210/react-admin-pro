
import { DropdownSubmenu } from "@/layouts/components/menu/dropdown-submenu"
import { SidebarInset } from "@rap/components-base/sidebar/index"
import { AppHeader } from "@/layouts/components/header"
import { AppContent } from "@/layouts/components/content"
import type { MenuItem } from "@/layouts/types"
import { MenuItemContent } from "@/layouts/components/menu/menu-item-content"
import { useLayout } from "@/layouts/context/layout-context"
import { useMenu } from "@/layouts/hooks/useMenu"
import { MenuService } from "@/layouts/service/menuService"
import { cn } from "@rap/utils"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { AppLogo } from "@/components/app/logo"


function HorizontalLayout () {
  const { userMenus } = useLayout();
  const menuService = new MenuService(userMenus);
  const { handleMenuItemClick } = useMenu({ menuService });

  return (
    <SidebarInset className="overflow-hidden min-w-0">
      <AppHeader
        rightFeatures={['globalSearch', 'themeSwitch', 'i18n', 'fullscreen', 'reload', 'notify', 'userCenter']}
        leftRender={
          <div className="flex items-center w-full">
            <div className="mr-6">
              <AppLogo  />
            </div>
            <HorizontalMenu
              className="flex-1"
              menus={userMenus}
              onMenuItemClick={handleMenuItemClick}
            />
          </div>
        }
      />
      <AppContent />
    </SidebarInset>
  );
};

interface HorizontalMenuProps {
  menus: MenuItem[];
  className?: string;
  onMenuItemClick?: (menu: MenuItem) => void;
}


function HorizontalMenu({ menus, onMenuItemClick, className }: HorizontalMenuProps) {
  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {menus.map((item) => (
        <HorizontalMenuItem
          key={item.id}
          item={item}
          onMenuItemClick={onMenuItemClick}
        />
      ))}
    </nav>
  );
}

interface HorizontalMenuItemProps {
  item: MenuItem;
  onMenuItemClick?: (menu: MenuItem) => void;
}

function HorizontalMenuItem({ item, onMenuItemClick }: HorizontalMenuItemProps) {
  if (item.hidden || item.status !== 'enabled' || item.type === 'button') return null;
  const { children } = item;
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <DropdownSubmenu
        item={item}
        side="bottom"
        align="start"
        open={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
        onItemClick={onMenuItemClick}
				showBadge={false}
				sideOffset={2}
      >
        <div className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent rounded-md transition-colors flex items-center gap-1 cursor-pointer">
          <MenuItemContent item={item} showBadge={false} />
          {children && <ChevronDown className={cn("size-4 transition-transform duration-200 ease-in-out", isOpen ? "rotate-180" : "")} />}
        </div>
      </DropdownSubmenu>
    </div>
  );
}



export default HorizontalLayout