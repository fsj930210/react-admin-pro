import { DataGrid } from "@rap/components-pro/data-grid";
import { Button } from "@rap/components-ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createDemoUsers, type DemoUser } from "./-demo-data";

export function ColumnOrderDataGridDemo() {
	const data = useMemo(() => createDemoUsers(20), []);
	const baseColumns = useMemo(() => createUserColumns(), []);
	const [reversed, setReversed] = useState(false);
	const columns = useMemo<ColumnDef<DemoUser>[]>(
		() => (reversed ? [...baseColumns].reverse() : baseColumns),
		[baseColumns, reversed],
	);

	return (
		<section className="space-y-3">
			<DemoTitle
				title="Column order extension"
				description="列排序不内置；外部调整 columns 顺序即可。"
			/>
			<Button variant="outline" onClick={() => setReversed((value) => !value)}>
				Toggle column order
			</Button>
			<DataGrid rowKey="id" columns={columns} data={data} scroll={{ x: 1300, y: 360 }} />
		</section>
	);
}
