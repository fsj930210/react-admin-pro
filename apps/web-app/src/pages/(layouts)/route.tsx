import { SidebarInset, SidebarProvider, Sidebar as BaseSidebar, SidebarContent, SidebarRail } from "@rap/components-base/resizable-sidebar";
import { Breadcrumb, Footer, Sidebar,  LayoutSidebarProvider, useFetchMenus} from "@/layouts";
import { LayoutTabs } from "@/layouts/components/tabs";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { APP_BASE_PATH } from "@/config";
import { useAuth } from "../login/-hooks/useAuth";
import { useMount } from "ahooks";
import { SidebarFooter } from "@/layouts/components/sidebar/sidebar-footer";
import { SidebarHeader } from "@/layouts/components/sidebar/sidebar-header";
import { SidebarSkeleton } from "@/layouts/components/skeleton/sidebar-skeleton";
import { TabsSkeleton } from "@/layouts/components/skeleton/tabs-skeleton";
import { BreadcrumbSkeleton } from "@/layouts/components/skeleton/breadcrumb-skeleton";
import { ContentSkeleton } from "@/layouts/components/skeleton/content-skeleton";

export const Route = createFileRoute("/(layouts)")({
	component: Layout,
});

function LayoutSkeleton() {
	return (
		<>
			<BaseSidebar collapsible="icon">
				<SidebarHeader logo={`${APP_BASE_PATH}/logo.svg`}  />
				<SidebarContent className="p-2">
					<SidebarSkeleton />
				</SidebarContent>
				<SidebarFooter />
				<SidebarRail />
			</BaseSidebar>
			<SidebarInset className="overflow-x-hidden min-w-0 p-6">
				<div className="h-9 space-y-2">
					<TabsSkeleton />
				</div>
				<div className="h-9.5 bg-background mt-4 space-y-2">
					<BreadcrumbSkeleton />
				</div>
				<div className="min-h-screen flex-1 rounded-xl md:min-h-min">
					<ContentSkeleton />
				</div>
			</SidebarInset>
		</>
	);
}
function Layout() {
	const { menus ,isLoading} = useFetchMenus();
	const { getUserInfoMutation } = useAuth();

	useMount(() => {
		getUserInfoMutation.mutate();
	});
	return (
		<SidebarProvider className="max-h-full">
			{
				isLoading ? <LayoutSkeleton /> : (
					<LayoutSidebarProvider menus={menus}>
						<Sidebar logo={`${APP_BASE_PATH}/logo.svg`} />
						<SidebarInset className="overflow-hidden min-w-0">
							<div className="h-9 bg-layout-tabs">
								<LayoutTabs />
							</div>
							<div className="h-9.5 bg-background">
								{/* <Header /> */}
								<Breadcrumb />
							</div>
							<div className="flex flex-col flex-1 bg-muted overflow-y-auto overflow-x-hidden">
								<div className="flex-1">
									<Outlet />
								</div>
							  	<Footer />
							</div>
						</SidebarInset>
					</LayoutSidebarProvider>
				)
			}
		</SidebarProvider>
	);
}
