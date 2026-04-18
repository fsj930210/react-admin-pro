import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/system/dict/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(layouts)/system/dict/"!</div>;
}
