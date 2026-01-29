
import { Sidebar, SidebarContent, SidebarInset, SidebarRail } from "@rap/components-base/resizable-sidebar"
import { APP_BASE_PATH } from "@/config"
import { AppHeader } from "@/layouts/components/header"
import { AppContent } from "@/layouts/components/content"
import { SidebarHeader } from "@/layouts/components/sidebar/sidebar-header"
import { SidebarMain } from "@/layouts/components/sidebar/sidebar-main"
import { SidebarFooter } from "@/layouts/components/sidebar/sidebar-footer"
import { useLayout } from "@/layouts/context/layout-context"


function VerticalLayoutSidebar () {
	const { userMenus } = useLayout()
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader logo={`${APP_BASE_PATH}/logo.svg`} />
			<SidebarContent>
        <SidebarMain menus={userMenus} />
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
		</Sidebar>
	)
}
function VerticalLayout ()  {
  return (
    <>
      <VerticalLayoutSidebar />
      <SidebarInset className="overflow-hidden min-w-0">
        <AppHeader />
        <AppContent />
      </SidebarInset>
    </>
  )
}

export default VerticalLayout