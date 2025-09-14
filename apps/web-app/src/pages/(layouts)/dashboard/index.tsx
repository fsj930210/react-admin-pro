import { Loading } from "@rap/components-ui/loading";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/(layouts)/dashboard/")({
	component: DashboardPage,
});

function DashboardPage() {
	return (
		<div className="size-full">
			<Loading />
			Hello "/_layout/dashborad/"!
		</div>
	);
}
