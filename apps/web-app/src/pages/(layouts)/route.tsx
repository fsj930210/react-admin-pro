import { useQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, type ComponentType } from "react";
import { LayoutProvider } from "@/layouts/context/layout-context";
import { MenuService } from "@/layouts/service/menuService";
import { VerticalLayout } from "@/layouts/ui/vertical-layout";
import { VerticalLayoutSkeleton } from "@/layouts/ui/vertical-layout/skeleton";
import { fetchUserInfo, fetchUserMenus } from "@/service/auth";
import { useUIPreferences } from "@/store/ui-preferences";

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

type LayoutComponent = ComponentType;

const HorizontalLayout = lazy(() =>
  import("@/layouts/ui/horizontal-layout").then((module) => ({
    default: module.HorizontalLayout,
  }))
);
const HorizontalLayoutSkeleton = lazy(() =>
  import("@/layouts/ui/horizontal-layout/skeleton").then((module) => ({
    default: module.HorizontalLayoutSkeleton,
  }))
);
const DoubleColumnLayout = lazy(() =>
  import("@/layouts/ui/double-column-layout").then((module) => ({
    default: module.DoubleColumnLayout,
  }))
);
const DoubleColumnLayoutSkeleton = lazy(() =>
  import("@/layouts/ui/double-column-layout/skeleton").then((module) => ({
    default: module.DoubleColumnLayoutSkeleton,
  }))
);
const SideLayout = lazy(() =>
  import("@/layouts/ui/side-layout").then((module) => ({
    default: module.SideLayout,
  }))
);
const SideLayoutSkeleton = lazy(() =>
  import("@/layouts/ui/side-layout/skeleton").then((module) => ({
    default: module.SideLayoutSkeleton,
  }))
);
const MixVerticalLayout = lazy(() =>
  import("@/layouts/ui/mix-vertical-layout").then((module) => ({
    default: module.MixVerticalLayout,
  }))
);
const MixVerticalLayoutSkeleton = lazy(() =>
  import("@/layouts/ui/mix-vertical-layout/skeleton").then((module) => ({
    default: module.MixVerticalLayoutSkeleton,
  }))
);
const MixDoubleColumnLayout = lazy(() =>
  import("@/layouts/ui/mix-double-column-layout").then((module) => ({
    default: module.MixDoubleColumnLayout,
  }))
);
const MixDoubleColumnLayoutSkeleton = lazy(() =>
  import("@/layouts/ui/mix-double-column-layout/skeleton").then((module) => ({
    default: module.MixDoubleColumnLayoutSkeleton,
  }))
);
const FullscreenLayout = lazy(() =>
  import("@/layouts/ui/fullscreen-layout").then((module) => ({
    default: module.FullscreenLayout,
  }))
);
const FullscreenLayoutSkeleton = lazy(() =>
  import("@/layouts/ui/fullscreen-layout/skeleton").then((module) => ({
    default: module.FullscreenLayoutSkeleton,
  }))
);

const LayoutComponentStrategies: Record<LayoutType, LayoutComponent> = {
  horizontal: HorizontalLayout,
  vertical: VerticalLayout,
  fullscreen: FullscreenLayout,
  side: SideLayout,
  "double-column": DoubleColumnLayout,
  "mix-vertical": MixVerticalLayout,
  "mix-double-column": MixDoubleColumnLayout,
};
const LayoutSkeletonStrategies: Record<LayoutType, LayoutComponent> = {
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
  const preferences = useUIPreferences("preferences");
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
  const resolvedType = preferences.layout.mode || type;
  const LayoutComponent =
    LayoutComponentStrategies[resolvedType] || LayoutComponentStrategies.vertical;
  const LayoutSkeleton =
    LayoutSkeletonStrategies[resolvedType] || LayoutSkeletonStrategies.vertical;
  return (
    <LayoutProvider menuService={menuService} userMenus={menus} userInfo={userInfo}>
      <Suspense fallback={<VerticalLayoutSkeleton />}>
        {loading ? <LayoutSkeleton /> : <LayoutComponent />}
      </Suspense>
    </LayoutProvider>
  );
}
