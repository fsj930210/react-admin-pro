import { SidebarInset, SidebarProvider } from "@rap/components-base/resizable-sidebar";
import { Breadcrumb, Footer, Sidebar,  LayoutSidebarProvider, useFetchMenus} from "@/layouts";
import { LayoutTabs } from "@/layouts/components/tabs";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { APP_BASE_PATH } from "@/config";


export const Route = createFileRoute("/(layouts)")({
	component: Layout,
});

function Layout() {
	const { menus } = useFetchMenus();
	return (
		<SidebarProvider defaultOpen>
			<LayoutSidebarProvider defaultMenus={menus}>
				<Sidebar logo={`${APP_BASE_PATH}/logo.svg`}  />
				<SidebarInset className="overflow-x-hidden min-w-0">
					<LayoutTabs />
					<div className="h-9.5 bg-background">
						{/* <Header /> */}
						<Breadcrumb />
					</div>
					<div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted">
						<div className="min-h-screen flex-1 rounded-xl md:min-h-min">
							<Outlet />
						</div>
					</div>
					<Footer />
				</SidebarInset>
			</LayoutSidebarProvider>
		</SidebarProvider>
	);
}
