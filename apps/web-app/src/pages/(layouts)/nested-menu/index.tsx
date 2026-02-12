import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/nested-menu/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>嵌套菜单（一级菜单）</div>;
}
