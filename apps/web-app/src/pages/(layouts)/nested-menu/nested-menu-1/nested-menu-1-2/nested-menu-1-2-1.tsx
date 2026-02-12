import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/nested-menu/nested-menu-1/nested-menu-1-2/nested-menu-1-2-1")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>嵌套菜单-1-2-1（四级级菜单-1-2-1）</div>;
};


