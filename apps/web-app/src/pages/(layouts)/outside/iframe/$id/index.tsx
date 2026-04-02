import { Button } from "@rap/components-base/button";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useLayout } from "@/layouts/context/layout-context";

export const Route = createFileRoute("/(layouts)/outside/iframe/$id/")({
	component: OutsideIframePage,
});

function OutsideIframePage() {
	const navigate = useNavigate();
	const { menuService } = useLayout();
	const id = useParams({
		from: "/(layouts)/outside/iframe/$id/",
		select: (params) => params.id,
	});
	const pathname = `/outside/iframe/${id}`;
	const selectedMenu = menuService.findMenuByUrl(pathname);

	if (!selectedMenu) {
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
	const fullUrl = selectedMenu?.fullUrl ?? "";
	return <iframe src={fullUrl} title="外部Iframe" className="size-full border-0"></iframe>;
}
