import { Sidebar, SidebarContent, SidebarRail } from "@rap/components-ui/sidebar";
import { SidebarMain } from "@/layouts/components/sidebar/sidebar-main";
import { SidebarFooter as AppSidebarFooter } from "@/layouts/components/sidebar/sidebar-footer";
import { SidebarHeader } from "@/layouts/components/sidebar/sidebar-header";
import type { MenuItem } from "@/layouts/types";
import { useUIPreferences } from "@/store/ui-preferences";

interface NavigationSidebarProps {
  menus: MenuItem[];
  showHeader?: boolean;
  showFooter?: boolean;
  showSearch?: boolean;
  className?: string;
}

export function NavigationSidebar({
  menus,
  showHeader = true,
  showFooter = true,
  showSearch = true,
  className,
}: NavigationSidebarProps) {
  const preferences = useUIPreferences("preferences");

  return (
    <Sidebar
      collapsible={preferences.layout.sidebar.collapsible ? "icon" : "none"}
      className={className}
    >
      {showHeader && <SidebarHeader showTrigger={preferences.layout.sidebar.showTrigger} />}
      <SidebarContent>
        <SidebarMain menus={menus} showSearch={showSearch} />
      </SidebarContent>
      {showFooter && <AppSidebarFooter />}
      <SidebarRail
        enableDrag={preferences.layout.sidebar.resizable}
        minResizeWidth={`${preferences.layout.sidebar.minWidth}px`}
        maxResizeWidth={`${preferences.layout.sidebar.maxWidth}px`}
      />
    </Sidebar>
  );
}
