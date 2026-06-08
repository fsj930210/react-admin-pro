import { SidebarInset, SidebarProvider, SidebarTrigger } from "@rap/components-ui/sidebar/index";
import { useResponsive } from "@rap/hooks/use-media-query";
import { AppLogo } from "@/components/app/logo";
import { AppContent } from "@/layouts/components/content";
import { AppHeader } from "@/layouts/components/header";
import { useLayout } from "@/layouts/context/layout-context";
import { MobileNavigationSidebar } from "@/layouts/navigation/mobile-navigation-sidebar";
import { NavigationHorizontal } from "@/layouts/navigation/navigation-horizontal";
import { NavigationSidebar } from "@/layouts/navigation/navigation-sidebar";
import { useNavigationSelection } from "@/layouts/navigation/use-navigation-selection";
import { useUIPreferences } from "@/store/ui-preferences";

export function MixVerticalLayout() {
  const preferences = useUIPreferences("preferences");
  const { userMenus } = useLayout();
  const { activeTopMenu, selectMenu } = useNavigationSelection();
  const { isMobile } = useResponsive();
  const secondLevelMenus = activeTopMenu?.children ?? [];

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
      <SidebarInset className="flex-row overflow-hidden min-h-auto h-[calc(100%-var(--app-header-height))]">
        {!isMobile && secondLevelMenus.length > 0 && (
          <NavigationSidebar
            menus={secondLevelMenus}
            showHeader={false}
            showFooter={false}
            showSearch={false}
            className="hidden md:flex h-[calc(100%-var(--app-header-height))] top-(--app-header-height)"
          />
        )}
        <AppContent />
      </SidebarInset>
    </SidebarProvider>
  );
}
