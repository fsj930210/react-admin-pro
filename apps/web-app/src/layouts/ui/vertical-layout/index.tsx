
import { 
	Sidebar,
	SidebarContent, 
	SidebarInset, 
	SidebarProvider, 
	SidebarRail 
} from "@rap/components-base/sidebar"
import { AppHeader } from "@/layouts/components/header"
import { AppContent } from "@/layouts/components/content"
import { SidebarHeader } from "@/layouts/components/sidebar/sidebar-header"
import { SidebarMain } from "@/layouts/components/sidebar/sidebar-main"
import { SidebarFooter } from "@/layouts/components/sidebar/sidebar-footer"
import { useLayout } from "@/layouts/context/layout-context"



function VerticalLayout ()  {
  return (
    <SidebarProvider>
      <VerticalLayoutSidebar />
      <SidebarInset className="overflow-hidden min-w-0">
        <AppHeader />
        <AppContent />
      </SidebarInset>
    </SidebarProvider>
  )
}

function VerticalLayoutSidebar () {
	const { userMenus } = useLayout()
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader />
			<SidebarContent>
				<SidebarMain menus={userMenus} />
			</SidebarContent>
			<SidebarFooter />
			<SidebarRail />
		</Sidebar>
	)
}

export default VerticalLayout