import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/components/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>组件列表</div>;
}
