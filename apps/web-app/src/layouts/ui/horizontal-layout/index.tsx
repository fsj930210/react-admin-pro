import { SidebarInset, SidebarProvider, SidebarTrigger } from "@rap/components-ui/sidebar/index";
import { AppLogo } from "@/components/app/logo";
import { AppContent } from "@/layouts/components/content";
import { AppHeader } from "@/layouts/components/header";
import { useLayout } from "@/layouts/context/layout-context";
import { MobileNavigationSidebar } from "@/layouts/navigation/mobile-navigation-sidebar";
import { NavigationHorizontal } from "@/layouts/navigation/navigation-horizontal";
import { useNavigationSelection } from "@/layouts/navigation/use-navigation-selection";
import { useUIPreferences } from "@/store/ui-preferences";

export function HorizontalLayout() {
  const { userMenus } = useLayout();
  const preferences = useUIPreferences("preferences");
  const { activeTopMenu, selectMenu } = useNavigationSelection();

  return (
    <SidebarProvider
      className="h-full min-h-auto overflow-hidden"
      defaultOpen={!preferences.layout.sidebar.defaultCollapsed}
      defaultWidth={`${preferences.layout.sidebar.width}px`}
      collapsedWidth={`${preferences.layout.sidebar.collapsedWidth}px`}
    >
      <MobileNavigationSidebar menus={userMenus} />
      <SidebarInset className="overflow-hidden min-w-0">
        <AppHeader
          rightFeatures={preferences.layout.header.rightFeatures}
          className="h-(--app-header-height)"
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
        <AppContent />
      </SidebarInset>
    </SidebarProvider>
  );
}
