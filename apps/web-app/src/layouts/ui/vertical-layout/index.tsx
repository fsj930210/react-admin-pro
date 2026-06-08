import { SidebarInset, SidebarProvider } from "@rap/components-ui/sidebar";
import { AppContent } from "@/layouts/components/content";
import { AppHeader } from "@/layouts/components/header";
import { useLayout } from "@/layouts/context/layout-context";
import { NavigationSidebar } from "@/layouts/navigation/navigation-sidebar";
import { useUIPreferences } from "@/store/ui-preferences";

export function VerticalLayout() {
  const preferences = useUIPreferences("preferences");
  return (
    <SidebarProvider
      className="h-full"
      defaultOpen={!preferences.layout.sidebar.defaultCollapsed}
      defaultWidth={`${preferences.layout.sidebar.width}px`}
      collapsedWidth={`${preferences.layout.sidebar.collapsedWidth}px`}
    >
      <VerticalLayoutSidebar />
      <SidebarInset className="min-height-auto overflow-hidden min-w-0 h-full">
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

function VerticalLayoutSidebar() {
  const { userMenus } = useLayout();
  return <NavigationSidebar menus={userMenus} />;
}
