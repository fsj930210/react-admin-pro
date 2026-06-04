import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  useSidebar,
} from "@rap/components-ui/sidebar/index";
import { cn } from "@rap/utils";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppLogo } from "@/components/app/logo";
import { AppContent } from "@/layouts/components/content";
import { AppHeader } from "@/layouts/components/header";
import { MenuItemContent } from "@/layouts/components/menu/menu-item-content";
import { SidebarMain } from "@/layouts/components/sidebar/sidebar-main";
import { useLayout } from "@/layouts/context/layout-context";
import { MenuService } from "@/layouts/service/menuService";
import type { MenuItem } from "@/layouts/types";
import { useUIPreferences } from "@/store/ui-preferences";

export function MixVerticalLayout() {
  const preferences = useUIPreferences("preferences");
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { userMenus } = useLayout();
  const menuService = useMemo(() => new MenuService(userMenus), [userMenus]);
  const [selectedFistLevelMenu, setSelectedFistLevelMenu] = useState<MenuItem | null>(null);
  const secondLevelMenus = selectedFistLevelMenu?.children ?? [];
  const isMenuItemClickRef = useRef(false);

  useEffect(() => {
    if (isMenuItemClickRef.current) {
      isMenuItemClickRef.current = false;
      return;
    }
    queueMicrotask(() => {
      const currentMenu = menuService.findMenuByUrl(pathname);
      if (currentMenu) {
        const ancestorMenus = menuService.findMenuAncestor(currentMenu.id);
        if (ancestorMenus.length > 0) {
          setSelectedFistLevelMenu(ancestorMenus[0]);
        }
      }
    });
  }, [pathname, menuService]);

  const handleMenuItemClick = (menu: MenuItem) => {
    isMenuItemClickRef.current = true;
    setSelectedFistLevelMenu(menu);
    if (menu.type === "menu") {
      navigate({ to: menu.url });
    } else if (menu.type === "dir") {
      const firstChildMenu = menuService.findFirstChildMenu(menu);
      if (firstChildMenu) {
        navigate({ to: firstChildMenu.url });
      }
    }
  };

  const handleHorizontalMenuItemClick = (menu: MenuItem) => {
    handleMenuItemClick(menu);
  };
  return (
    <SidebarProvider
      className="flex flex-col h-full min-h-auto overflow-hidden"
      defaultOpen={!preferences.layout.sidebar.defaultCollapsed}
      defaultWidth={`${preferences.layout.sidebar.width}px`}
      collapsedWidth={`${preferences.layout.sidebar.collapsedWidth}px`}
    >
      <AppHeader
        className="border-b h-(--app-header-height)"
        rightFeatures={preferences.layout.header.rightFeatures}
        leftRender={
          <div className="flex items-center w-full">
            <div className="mr-6">
              <AppLogo />
            </div>
            <HorizontalMenu
              className="flex-1"
              menus={userMenus || []}
              onMenuItemClick={handleHorizontalMenuItemClick}
              selectedItem={selectedFistLevelMenu}
            />
          </div>
        }
      />
      <SidebarInset className="flex-row overflow-hidden min-h-auto h-[calc(100%-var(--app-header-height))]">
        <MixVerticalLayoutSidebar menus={secondLevelMenus} />
        <AppContent />
      </SidebarInset>
    </SidebarProvider>
  );
}

interface HorizontalMenuProps {
  menus: MenuItem[];
  className?: string;
  selectedItem?: MenuItem | null;
  onMenuItemClick?: (menu: MenuItem) => void;
}

function HorizontalMenu({ menus, onMenuItemClick, className, selectedItem }: HorizontalMenuProps) {
  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {menus.map((item) => (
        <button
          type="button"
          key={item.id}
          className={cn(
            "flex-center h-full cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground my-1 mx-2 p-2 text-sm whitespace-nowrap overflow-hidden rounded-md",
            selectedItem?.id === item.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
          )}
          onClick={() => onMenuItemClick?.(item)}
        >
          <MenuItemContent
            item={item}
            searchKeywords={[]}
            showBadge={false}
            className="justify-center"
          />
        </button>
      ))}
    </nav>
  );
}

interface MixVerticalLayoutSidebarProps {
  menus: MenuItem[];
}
function MixVerticalLayoutSidebar({ menus }: MixVerticalLayoutSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const preferences = useUIPreferences("preferences");
  return menus.length > 0 ? (
    <Sidebar
      collapsible={preferences.layout.sidebar.collapsible ? "icon" : "none"}
      className={`h-[calc(100%-var(--app-header-height))] top-(--app-header-height) flex-1 transition-all duration-300`}
    >
      <SidebarContent>
        <SidebarMain menus={menus} showSearch={false} />
      </SidebarContent>
      <SidebarFooter>
        <button
          className="flex-center size-6 rounded-xs cursor-pointer bg-muted"
          onClick={toggleSidebar}
          type="button"
        >
          {state === "collapsed" ? (
            <ChevronsRight className="size-4" />
          ) : (
            <ChevronsLeft className="size-4" />
          )}
        </button>
      </SidebarFooter>
      <SidebarRail
        enableDrag={preferences.layout.sidebar.resizable}
        minResizeWidth={`${preferences.layout.sidebar.minWidth}px`}
        maxResizeWidth={`${preferences.layout.sidebar.maxWidth}px`}
      />
    </Sidebar>
  ) : null;
}
