import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/components/table/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(layouts)/components/table/"!</div>;
}
