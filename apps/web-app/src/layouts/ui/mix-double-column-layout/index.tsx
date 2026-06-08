import { SidebarInset, SidebarProvider, SidebarTrigger } from "@rap/components-ui/sidebar";
import { useResponsive } from "@rap/hooks/use-media-query";
import { AppLogo } from "@/components/app/logo";
import { AppContent } from "@/layouts/components/content";
import { AppHeader } from "@/layouts/components/header";
import { User } from "@/layouts/components/sidebar/sidebar-user";
import { useLayout } from "@/layouts/context/layout-context";
import { MobileNavigationSidebar } from "@/layouts/navigation/mobile-navigation-sidebar";
import { NavigationHorizontal } from "@/layouts/navigation/navigation-horizontal";
import { NavigationRail } from "@/layouts/navigation/navigation-rail";
import { NavigationSidebar } from "@/layouts/navigation/navigation-sidebar";
import { useNavigationSelection } from "@/layouts/navigation/use-navigation-selection";
import { useUIPreferences } from "@/store/ui-preferences";

export function MixDoubleColumnLayout() {
  const preferences = useUIPreferences("preferences");
  const { userMenus } = useLayout();
  const { isMobile } = useResponsive();
  const { activeTopMenu, activeSecondMenu, selectMenu } = useNavigationSelection();
  const secondLevelMenus = activeTopMenu?.children ?? [];
  const thirdLevelMenus = activeSecondMenu?.children ?? [];

  return (
    <SidebarProvider
      className="flex flex-col h-full min-h-auto overflow-hidden"
      defaultOpen={!preferences.layout.sidebar.defaultCollapsed}
      defaultWidth={`${preferences.layout.sidebar.width}px`}
      collapsedWidth={`${preferences.layout.sidebar.collapsedWidth}px`}
    >
      <MobileNavigationSidebar menus={userMenus} />
      <AppHeader
        className="border-b h-(--app-header-height)"
        rightFeatures={preferences.layout.header.rightFeatures}
        leftRender={
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            <SidebarTrigger className="md:hidden" />
            <div className="mr-2 shrink-0 md:mr-4">
              <AppLogo showTitle={false} />
            </div>
            <NavigationHorizontal
              className="hidden md:flex"
              menus={userMenus}
              activeItem={activeTopMenu}
              onSelect={selectMenu}
            />
          </div>
        }
      />
      <SidebarInset className="flex-row min-h-auto overflow-hidden min-w-0 flex-1">
        {!isMobile && secondLevelMenus.length > 0 && (
          <div className="flex h-full">
            <div className="flex h-full w-22 shrink-0 flex-col items-center border-r py-2">
              <NavigationRail
                className="min-h-0 flex-1 border-r-0 py-0"
                menus={secondLevelMenus}
                activeItem={activeSecondMenu}
                onSelect={selectMenu}
              />
              <User />
            </div>
            {thirdLevelMenus.length > 0 && (
              <NavigationSidebar
                menus={thirdLevelMenus}
                showHeader={false}
                showFooter={false}
                showSearch={false}
                className="h-full left-22"
              />
            )}
          </div>
        )}
        <AppContent />
      </SidebarInset>
    </SidebarProvider>
  );
}
