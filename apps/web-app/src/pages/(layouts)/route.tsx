import { SidebarInset, SidebarProvider, Sidebar as BaseSidebar, SidebarContent, SidebarRail } from "@rap/components-base/resizable-sidebar";
// import { useFetchMenus } from "@/layouts";
import { createFileRoute } from "@tanstack/react-router";
import { APP_BASE_PATH } from "@/config";
import { useAuth } from "../login/-hooks/useAuth";
import { useMount } from "ahooks";
import { LayoutProvider } from "@/layouts/context/layout-context";
import { MenuService } from "@/layouts/service/menuService";
import VerticalLayout from "@/layouts/ui/vertical-layout";
import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchUserInfo, fetchUserMenus } from "@/service/auth";
import HorizontalLayout from "@/layouts/ui/horizontal-layout";

export const Route = createFileRoute("/(layouts)")({
	component: Layout,
});

// function LayoutSkeleton() {
// 	return (
// 		<>
// 			<BaseSidebar collapsible="icon">
// 				<SidebarHeader logo={`${APP_BASE_PATH}/logo.svg`}  />
// 				<SidebarContent className="p-2">
// 					<SidebarSkeleton />
// 				</SidebarContent>
// 				<SidebarFooter />
// 				<SidebarRail />
// 			</BaseSidebar>
// 			<SidebarInset className="overflow-x-hidden min-w-0 p-6">
// 				<div className="h-9 space-y-2">
// 					<TabsSkeleton />
// 				</div>
// 				<div className="h-9.5 bg-background mt-4 space-y-2">
// 					<BreadcrumbSkeleton />
// 				</div>
// 				<div className="min-h-screen flex-1 rounded-xl md:min-h-min">
// 					<ContentSkeleton />
// 				</div>
// 			</SidebarInset>
// 		</>
// 	);
// }
function Layout() {
	const queryResults = useQueries({
    queries: [
      {
        queryKey: ['fetchUserInfo'],
        queryFn: fetchUserInfo,
      },
      {
        queryKey: ['fetchUserMenus'],
        queryFn: fetchUserMenus,
      },
    ],
  });
  const [userInfoResult, userMenusResult] = queryResults;
	const menus = userMenusResult.data?.data ?? [];
	const userInfo = userInfoResult.data?.data ?? null
  const loading = queryResults.some((result) => result.isLoading);
	const menuService = new MenuService(menus);

	return (
		<SidebarProvider className="max-h-full">
			{
				loading ? null : (
					<LayoutProvider
						menuService={menuService}
						userMenus={menus}
						userInfo={userInfo}
					>
						<HorizontalLayout />
						{/* <VerticalLayout /> */}
					</LayoutProvider>
				)
			}
		</SidebarProvider>
	);
}
