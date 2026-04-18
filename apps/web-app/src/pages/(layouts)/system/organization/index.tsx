import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/system/organization/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(layouts)/system/organization/"!</div>;
}
