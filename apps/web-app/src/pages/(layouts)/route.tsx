import { useQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { LayoutProvider } from "@/layouts/context/layout-context";
import { MenuService } from "@/layouts/service/menuService";
import { DoubleColumnLayout } from "@/layouts/ui/double-column-layout";
import { HorizontalLayout } from "@/layouts/ui/horizontal-layout";
import { MixDoubleColumnLayout } from "@/layouts/ui/mix-double-column-layout";
import { MixVerticalLayout } from "@/layouts/ui/mix-vertical-layout";
import { SideLayout} from "@/layouts/ui/side-layout";
import { VerticalLayout } from "@/layouts/ui/vertical-layout";
import { FullscreenLayout } from "@/layouts/ui/fullscreen-layout";
import { fetchUserInfo, fetchUserMenus } from "@/service/auth";

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
type LayoutType =
	| "horizontal"
	| "vertical"
	| "double-column"
	| "side"
	| "mix-vertical"
	| "mix-double-column"
	| "fullscreen";
const LayoutComponentStrategies = {
	horizontal: HorizontalLayout,
	vertical: VerticalLayout,
	"double-column": DoubleColumnLayout,
	side: SideLayout,
	"mix-vertical": MixVerticalLayout,
	"mix-double-column": MixDoubleColumnLayout,
	"fullscreen": FullscreenLayout,
};
interface LayoutProps {
	type?: LayoutType;
}
function Layout({ type = "vertical" }: LayoutProps) {
	const queryResults = useQueries({
		queries: [
			{
				queryKey: ["fetchUserInfo"],
				queryFn: fetchUserInfo,
			},
			{
				queryKey: ["fetchUserMenus"],
				queryFn: fetchUserMenus,
			},
		],
	});
	const [userInfoResult, userMenusResult] = queryResults;
	const menus = userMenusResult.data?.data ?? [];
	const userInfo = userInfoResult.data?.data ?? null;
	const loading = queryResults.some((result) => result.isLoading);
	const menuService = new MenuService(menus);
	const LayoutComponent = LayoutComponentStrategies[type] || LayoutComponentStrategies["vertical"];
	return (
		<>
			{loading ? null : (
				<LayoutProvider menuService={menuService} userMenus={menus} userInfo={userInfo}>
					<LayoutComponent />
				</LayoutProvider>
			)}
		</>
	);
}
