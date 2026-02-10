import { Button } from "@rap/components-base/button";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: () => (
		<>
			<Outlet />
			<ReactQueryDevtools buttonPosition="bottom-right" />
			<TanStackRouterDevtools position="bottom-right" />
		</>
	),
	notFoundComponent: NotFoundComponent,
});

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
