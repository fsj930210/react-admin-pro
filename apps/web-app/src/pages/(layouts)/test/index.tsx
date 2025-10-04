import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "../dashboard";
import { OverviewPage } from "../overview";

export const Route = createFileRoute("/(layouts)/test/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<OverviewPage />
			<DashboardPage />
		</div>
	);
}
