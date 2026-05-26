import { DataGrid } from "@rap/components-pro/data-grid";
import { useMemo } from "react";
import { DemoTitle } from "./-basic";
import type { DemoUser } from "./-demo-data";
import { createDemoUsers } from "./-demo-data";

export function NoScrollDataGridDemo() {
	const data = useMemo(() => createDemoUsers(6), []);
	const columns = useMemo(
		() =>
			[
				{ accessorKey: "name", header: "Name", size: 180 },
				{ accessorKey: "email", header: "Email", size: 240, meta: { ellipsis: true } },
				{ accessorKey: "department", header: "Department", size: 160 },
				{ accessorKey: "status", header: "Status", size: 130 },
			] satisfies DataGridColumn[],
		[],
	);

	return (
		<section className="space-y-3">
			<DemoTitle
				title="No scroll"
				description="A compact table without scroll config. Columns use normal layout without horizontal or vertical scrollbars."
			/>
			<DataGrid rowKey="id" columns={columns} data={data} pagination={false} border />
		</section>
	);
}

type DataGridColumn = import("@tanstack/react-table").ColumnDef<DemoUser>;
