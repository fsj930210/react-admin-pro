import {
	Sidebar,
	SidebarContent,
	SidebarInset,
	SidebarProvider,
	SidebarRail,
} from "@rap/components-base/sidebar";
import { AppContent } from "@/layouts/components/content";
import { AppHeader } from "@/layouts/components/header";
import { SidebarFooter } from "@/layouts/components/sidebar/sidebar-footer";
import { SidebarHeader } from "@/layouts/components/sidebar/sidebar-header";
import { SidebarMain } from "@/layouts/components/sidebar/sidebar-main";
import { useLayout } from "@/layouts/context/layout-context";

export function VerticalLayout() {
	return (
		<SidebarProvider className="h-full">
			<VerticalLayoutSidebar />
			<SidebarInset className="min-height-auto overflow-hidden min-w-0 h-full">
				<AppHeader />
				<AppContent />
			</SidebarInset>
		</SidebarProvider>
	);
}

function VerticalLayoutSidebar() {
	const { userMenus } = useLayout();
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader />
			<SidebarContent>
				<SidebarMain menus={userMenus} />
			</SidebarContent>
			<SidebarFooter />
			<SidebarRail />
		</Sidebar>
	);
}
