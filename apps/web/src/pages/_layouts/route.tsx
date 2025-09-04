import { SidebarInset, SidebarProvider } from "@rap/components-base/sidebar";
import { Footer, Sidebar } from "@rap/components-ui/layouts";
import { LayoutTabs } from "@rap/components-ui/tabs";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layouts")({
	component: Layout,
});

function Layout() {
	return (
		<SidebarProvider>
			<Sidebar />
			<SidebarInset className="overflow-x-hidden min-w-0">
				<div className="border-b-1 border-b-solid border-b-border">
					{/* <Header /> */}
				</div>
				<LayoutTabs />
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
