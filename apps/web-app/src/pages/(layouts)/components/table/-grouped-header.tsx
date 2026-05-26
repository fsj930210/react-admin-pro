import { DataGrid } from "@rap/components-pro/data-grid";
import { Button } from "@rap/components-ui/button";
import type { ColumnDef, ColumnPinningState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DemoTitle } from "./-basic";
import type { DemoUser } from "./-demo-data";
import { createDemoUsers } from "./-demo-data";

const pinnedEdgeGroupsPinning = {
	left: ["profile-name", "profile-email"],
	right: ["metrics-salary", "metrics-score", "metrics-status"],
};
const unpinnedEdgePinning = { left: [], right: [] };

export function GroupedHeaderDataGridDemo() {
	const data = useMemo(() => createDemoUsers(18), []);
	const [columnPinning, setColumnPinning] =
		useState<ColumnPinningState>(pinnedEdgeGroupsPinning);
	const pinningMode = getEdgePinningMode(columnPinning);
	const columns = useMemo<ColumnDef<DemoUser>[]>(
		() => [
			{
				id: "profile",
				header: "Profile",
				columns: [
					{ accessorKey: "name", header: "Name", size: 180 },
					{ accessorKey: "email", header: "Email", size: 240, meta: { ellipsis: true } },
				],
			},
			{ accessorKey: "age", header: "Age", size: 110 },
			{ accessorKey: "department", header: "Department", size: 160 },
			{ accessorKey: "position", header: "Position", size: 190, meta: { ellipsis: true } },
			{ accessorKey: "joinDate", header: "Join Date", size: 150 },
			{
				id: "audit",
				header: "Audit",
				columns: [
					{ id: "recordId", header: "Record ID", accessorFn: (row) => row.id, size: 150 },
					{
						id: "salaryBand",
						header: "Salary Band",
						accessorFn: (row) => (row.salary >= 16_000 ? "Senior" : "Standard"),
						size: 150,
					},
					{
						id: "reviewCycle",
						header: "Review Cycle",
						accessorFn: (row) => `Q${(row.score % 4) + 1}`,
						size: 140,
					},
				],
			},
			{
				id: "metrics",
				header: "Metrics",
				columns: [
					{ accessorKey: "salary", header: "Salary", size: 130 },
					{ accessorKey: "score", header: "Score", size: 110 },
					{ accessorKey: "status", header: "Status", size: 130 },
				],
			},
		],
		[],
	);

	return (
		<section className="space-y-3">
			<DemoTitle
				title="Grouped header"
				description="Profile is pinned left as a group, Metrics is pinned right as a group, and the middle columns stay scrollable."
			/>
			<div className="flex flex-wrap gap-2">
				<Button
					variant={pinningMode === "groups" ? "default" : "outline"}
					onClick={() => setColumnPinning(pinnedEdgeGroupsPinning)}
				>
					Pin edge groups
				</Button>
				<Button
					variant={pinningMode === "none" ? "default" : "outline"}
					onClick={() => setColumnPinning(unpinnedEdgePinning)}
				>
					Unpin all
				</Button>
			</div>
			<DataGrid
				rowKey="id"
				columns={columns}
				data={data}
				scroll={{ x: 1800, y: 360 }}
				border
				striped
				columnPinning={{
					value: columnPinning,
					onChange: setColumnPinning,
				}}
				columnOrdering={{ drag: true }}
				contextMenu={{ enable: true }}
			/>
		</section>
	);
}

function getEdgePinningMode(columnPinning: ColumnPinningState) {
	const left = columnPinning.left ?? [];
	const right = columnPinning.right ?? [];
	const profileIds = ["profile-name", "profile-email"];
	const metricsIds = ["metrics-salary", "metrics-score", "metrics-status"];
	const pinnedProfileCount = profileIds.filter((id) => left.includes(id)).length;
	const pinnedMetricsCount = metricsIds.filter((id) => right.includes(id)).length;

	if (pinnedProfileCount === profileIds.length && pinnedMetricsCount === metricsIds.length) {
		return "groups";
	}
	return "none";
}
