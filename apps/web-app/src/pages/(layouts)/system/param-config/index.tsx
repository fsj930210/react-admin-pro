import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/system/param-config/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(layouts)/system/param-config/"!</div>;
}
