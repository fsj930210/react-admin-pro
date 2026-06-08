import { SidebarInset, SidebarProvider } from "@rap/components-ui/sidebar";
import { useResponsive } from "@rap/hooks/use-media-query";
import { AppLogo } from "@/components/app/logo";
import { AppContent } from "@/layouts/components/content";
import { AppHeader } from "@/layouts/components/header";
import { User } from "@/layouts/components/sidebar/sidebar-user";
import { useLayout } from "@/layouts/context/layout-context";
import { MobileNavigationSidebar } from "@/layouts/navigation/mobile-navigation-sidebar";
import { NavigationRail } from "@/layouts/navigation/navigation-rail";
import { NavigationSidebar } from "@/layouts/navigation/navigation-sidebar";
import { useNavigationSelection } from "@/layouts/navigation/use-navigation-selection";
import { useUIPreferences } from "@/store/ui-preferences";

export function DoubleColumnLayout() {
  const preferences = useUIPreferences("preferences");
  const { userMenus } = useLayout();
  const { activeTopMenu, selectMenu } = useNavigationSelection();
  const { isMobile } = useResponsive();
  const secondLevelMenus = activeTopMenu?.children ?? [];

  return (
    <SidebarProvider
      className="h-full"
      defaultOpen={!preferences.layout.sidebar.defaultCollapsed}
      defaultWidth={`${preferences.layout.sidebar.width}px`}
      collapsedWidth={`${preferences.layout.sidebar.collapsedWidth}px`}
    >
      <MobileNavigationSidebar menus={userMenus} />
      {!isMobile && (
        <div className="hidden h-full md:flex">
          <div className="flex h-full w-22 shrink-0 flex-col items-center border-r py-2">
            <AppLogo showTitle={false} />
            <NavigationRail
              className="min-h-0 flex-1 border-r-0 py-0"
              menus={userMenus}
              activeItem={activeTopMenu}
              onSelect={selectMenu}
              itemHeight="h-15"
            />
            <User />
          </div>
          {secondLevelMenus.length > 0 && (
            <NavigationSidebar
              menus={secondLevelMenus}
              showHeader={false}
              showFooter={false}
              showSearch={false}
              className="h-full left-22"
            />
          )}
        </div>
      )}
      <SidebarInset className="h-full min-h-auto overflow-hidden min-w-0">
        <AppHeader
          leftFeatures={["collapse-sidebar", ...preferences.layout.header.leftFeatures]}
          rightFeatures={preferences.layout.header.rightFeatures}
          className="h-(--app-header-height)"
        />
        <AppContent />
      </SidebarInset>
    </SidebarProvider>
  );
}
