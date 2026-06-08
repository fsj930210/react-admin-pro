import { SidebarInset, SidebarProvider } from "@rap/components-ui/sidebar";
import { AppContent } from "@/layouts/components/content";
import { AppHeader } from "@/layouts/components/header";
import { useLayout } from "@/layouts/context/layout-context";
import { NavigationSidebar } from "@/layouts/navigation/navigation-sidebar";
import { useUIPreferences } from "@/store/ui-preferences";

export function SideLayout() {
  const preferences = useUIPreferences("preferences");
  return (
    <SidebarProvider
      className="flex flex-col h-full min-h-auto overflow-hidden"
      defaultOpen={!preferences.layout.sidebar.defaultCollapsed}
      defaultWidth={`${preferences.layout.sidebar.width}px`}
      collapsedWidth={`${preferences.layout.sidebar.collapsedWidth}px`}
    >
      <AppHeader
        leftFeatures={["collapse-sidebar", "logo", "breadcrumb"]}
        rightFeatures={preferences.layout.header.rightFeatures}
        className="border-b h-(--app-header-height)"
      />
      <div className="flex flex-1 overflow-hidden h-[calc(100%-var(--app-header-height))]">
        <SideLayoutSidebar />
        <SidebarInset className="overflow-hidden h-full min-h-0">
          <AppContent />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function SideLayoutSidebar() {
  const { userMenus } = useLayout();
  return (
    <NavigationSidebar
      menus={userMenus}
      showHeader={false}
      className="top-(--app-header-height) h-[calc(100%-var(--app-header-height))]"
    />
  );
}
