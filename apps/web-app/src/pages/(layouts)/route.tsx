import { SidebarInset, SidebarProvider } from "@rap/components-base/sidebar";
import { Footer, Sidebar, Breadcrumb } from "@rap/components-ui/layouts";
import { LayoutTabs } from "@rap/components-ui/tabs";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { APP_BASE_PATH } from "@/config";

export const Route = createFileRoute("/(layouts)")({
	component: Layout,
});

function Layout() {
	return (
		<SidebarProvider>
			<Sidebar logo={`${APP_BASE_PATH}/logo.svg`} />
			<SidebarInset className="overflow-x-hidden min-w-0">
				<LayoutTabs />
				<div className="h-9.5 bg-background">
					{/* <Header /> */}
					<Breadcrumb />
				</div>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted">
					<div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
						<Outlet />
					</div>
				</div>
				<Footer />
			</SidebarInset>
		</SidebarProvider>
	);
}
