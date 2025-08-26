import { createFileRoute } from "@tanstack/react-router";
import { Loading } from "@rap/components-ui/loading";
export const Route = createFileRoute("/_layouts/dashboard/")({
	component: DashboardPage,
});

function DashboardPage() {
	return <div className="size-full">
		<Loading />
		Hello "/_layout/dashborad/"!
	</div>;
}
