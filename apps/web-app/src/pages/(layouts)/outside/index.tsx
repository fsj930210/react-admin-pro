import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/outside/")({
	component: OutsidePage,
});

function OutsidePage() {
	return <div>外部页面</div>;
}
