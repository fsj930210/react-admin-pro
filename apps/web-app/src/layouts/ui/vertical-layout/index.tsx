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
import { SidebarHeader } from "@/layouts/components/sidebar/sidebar-header";
import { SidebarMain } from "@/layouts/components/sidebar/sidebar-main";
import { useLayout } from "@/layouts/context/layout-context";
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
          leftFeatures={preferences.layout.header.leftFeatures}
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
  const preferences = useUIPreferences("preferences");
  return (
    <Sidebar collapsible={preferences.layout.sidebar.collapsible ? "icon" : "none"}>
      <SidebarHeader showTrigger={preferences.layout.sidebar.showTrigger} />
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
