import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/features/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>特性列表</div>;
}
