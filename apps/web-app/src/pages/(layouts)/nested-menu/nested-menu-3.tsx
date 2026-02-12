
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/nested-menu/nested-menu-3")({
	component: RouteComponent,
});

function RouteComponent() {
  return <div>嵌套菜单-3（二级菜单-3）</div>;
};


