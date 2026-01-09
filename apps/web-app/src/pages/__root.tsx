import { Button } from "@rap/components-base/button";
import { Outlet, useNavigate, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { QueryClient } from '@tanstack/react-query';

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient
}>()({
	component: () => (
		<>
			<Outlet />
			<ReactQueryDevtools buttonPosition="top-right" />
			<TanStackRouterDevtools position="bottom-right" />
		</>
	),
	notFoundComponent: NotFoundComponent
});


function NotFoundComponent() {
	const navigate = useNavigate()
	return (
		<div className="flex-center flex-col p-4 gap-4">
			<h3>404-页面未找到</h3>
			<p>你访问的页面不存在。</p>
			<Button onClick={() => navigate({ to: '/overview', replace: true})} type="button">返回首页</Button>
		</div>
	)
}
