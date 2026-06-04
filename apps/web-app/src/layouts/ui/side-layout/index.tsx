import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@rap/components-ui/sidebar";
import { AppContent } from "@/layouts/components/content";
import { AppHeader } from "@/layouts/components/header";
import { SidebarFooter } from "@/layouts/components/sidebar/sidebar-footer";
import { SidebarMain } from "@/layouts/components/sidebar/sidebar-main";
import { useLayout } from "@/layouts/context/layout-context";
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
        leftFeatures={["logo", "breadcrumb"]}
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
  const preferences = useUIPreferences("preferences");
  return (
    <Sidebar
      collapsible={preferences.layout.sidebar.collapsible ? "icon" : "none"}
      className="top-(--app-header-height) h-[calc(100%-var(--app-header-height))]"
    >
      <SidebarContent>
        <SidebarMain menus={userMenus} />
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail
        enableDrag={preferences.layout.sidebar.resizable}
        minResizeWidth={`${preferences.layout.sidebar.minWidth}px`}
        maxResizeWidth={`${preferences.layout.sidebar.maxWidth}px`}
      />
    </Sidebar>
  );
}
