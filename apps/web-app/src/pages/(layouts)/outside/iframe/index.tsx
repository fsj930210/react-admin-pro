import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/outside/iframe/")({
	component: OutsideIframePage,
});

function OutsideIframePage() {
	return <div>使用iframe打开外部页面</div>;
}
