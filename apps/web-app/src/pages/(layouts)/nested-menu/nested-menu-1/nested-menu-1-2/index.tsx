import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/nested-menu/nested-menu-1/nested-menu-1-2/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>嵌套菜单-1-2（三级菜单-1-2）</div>;
};


