
import { 
	Sidebar,
	SidebarContent, 
	SidebarInset, 
	SidebarProvider, 
	SidebarRail 
} from "@rap/components-base/sidebar";
import { AppHeader } from "@/layouts/components/header";
import { AppContent } from "@/layouts/components/content";
import { SidebarMain } from "@/layouts/components/sidebar/sidebar-main";
import { SidebarFooter } from "@/layouts/components/sidebar/sidebar-footer";
import { useLayout } from "@/layouts/context/layout-context";


function SideLayoutSidebar () {
	const { userMenus } = useLayout()
	return (
		<Sidebar collapsible="icon" className="top-11 h-[calc(100%-var(--spacing)*11)]">
			<SidebarContent>
				<SidebarMain menus={userMenus} />
			</SidebarContent>
			<SidebarFooter />
			<SidebarRail />
		</Sidebar>
	)
}
function SideLayout ()  {
	return (
		<SidebarProvider className="flex flex-col h-full min-h-auto overflow-hidden">
			<AppHeader leftFeatures={['logo', 'breadcrumb']} className="border-b" />
			<div className="flex flex-1 overflow-hidden h-[calc(100%-var(--spacing)*11)]">
				<SideLayoutSidebar  />
				<SidebarInset className="overflow-hidden h-full min-h-0">
					<AppContent />
				</SidebarInset>
			</div>
		</SidebarProvider>
	)
}

export default SideLayout;
