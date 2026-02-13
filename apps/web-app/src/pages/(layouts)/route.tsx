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
import { DoubleColumnLayoutSkeleton } from "@/layouts/ui/double-column-layout/skeleton";
import { VerticalLayoutSkeleton } from "@/layouts/ui/vertical-layout/skeleton";
import { SideLayoutSkeleton } from "@/layouts/ui/side-layout/skeleton";
import { HorizontalLayoutSkeleton } from "@/layouts/ui/horizontal-layout/skeleton";
import { FullscreenLayoutSkeleton } from "@/layouts/ui/fullscreen-layout/skeleton";
import { MixVerticalLayoutSkeleton } from "@/layouts/ui/mix-vertical-layout/skeleton";
import { MixDoubleColumnLayoutSkeleton } from "@/layouts/ui/mix-double-column-layout/skeleton";

export const Route = createFileRoute("/(layouts)")({
	component: Layout,
});

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
	fullscreen: FullscreenLayout,
	side: SideLayout,
	"double-column": DoubleColumnLayout,
	"mix-vertical": MixVerticalLayout,
	"mix-double-column": MixDoubleColumnLayout,
};
const LayoutSkeletonStrategies = {
	horizontal: HorizontalLayoutSkeleton,
	vertical: VerticalLayoutSkeleton,
	side: SideLayoutSkeleton,
	fullscreen: FullscreenLayoutSkeleton,
	"double-column": DoubleColumnLayoutSkeleton,
	"mix-vertical": MixVerticalLayoutSkeleton,
	"mix-double-column": MixDoubleColumnLayoutSkeleton,
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
	const LayoutSkeleton = LayoutSkeletonStrategies[type] || LayoutSkeletonStrategies["vertical"];
	return (
		<LayoutProvider menuService={menuService} userMenus={menus} userInfo={userInfo}>
			{loading ? (
				<LayoutSkeleton />
			) : (
				<LayoutComponent />
			)}
		</LayoutProvider>
	);
}
