import { Button } from "@rap/components-ui/button";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((module) => ({
        default: module.ReactQueryDevtools,
      }))
    )
  : null;

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-router-devtools").then((module) => ({
        default: module.TanStackRouterDevtools,
      }))
    )
  : null;

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => (
    <>
      <Outlet />
      <Devtools />
    </>
  ),
  notFoundComponent: NotFoundComponent,
});

function Devtools() {
  if (!ReactQueryDevtools || !TanStackRouterDevtools) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <TanStackRouterDevtools position="bottom-right" />
    </Suspense>
  );
}

function NotFoundComponent() {
  const navigate = useNavigate();
  return (
    <div className="flex-center flex-col p-4 gap-4">
      <h3>404-页面未找到</h3>
      <p>你访问的页面不存在。</p>
      <Button onClick={() => navigate({ to: "/overview", replace: true })} type="button">
        返回首页
      </Button>
    </div>
  );
}
