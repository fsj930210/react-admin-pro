
import { StatCards } from "./-components/StatCards";
import { LineChart } from "./-components/LineChart";
import { PieChart } from "./-components/PieChart";
import { RadarChart } from "./-components/RadarChart";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/dashboard/")({
	component: DashboardPage,
});

export function DashboardPage() {
	return (
		<div className="size-full flex flex-col gap-6 p-6 overflow-auto">
			<StatCards />
			<div>
				<LineChart />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<PieChart />
				<RadarChart />
			</div>
		</div>
	);
}
