import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/nested-menu/nested-menu-2/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>嵌套菜单-2（二级菜单-2）</div>;
}
