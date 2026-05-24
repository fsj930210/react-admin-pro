import { DataGrid } from "@rap/components-pro/data-grid";
import { Button } from "@rap/components-ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useMemo, useState } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createDemoUsers, type DemoUser } from "./-demo-data";

export function RowOrderDataGridDemo() {
	const [data, setData] = useState(() => createDemoUsers(16));
	const columns = useMemo<ColumnDef<DemoUser>[]>(
		() =>
			createUserColumns([
				{
					id: "order",
					header: "Order",
					size: 100,
					cell: ({ row }) => (
						<div className="flex gap-1">
							<Button
								size="icon"
								variant="ghost"
								className="size-7"
								onClick={() => moveRow(row.index, row.index - 1)}
							>
								<ArrowUp className="size-3.5" />
							</Button>
							<Button
								size="icon"
								variant="ghost"
								className="size-7"
								onClick={() => moveRow(row.index, row.index + 1)}
							>
								<ArrowDown className="size-3.5" />
							</Button>
						</div>
					),
				},
			]),
		[],
	);

	const moveRow = (from: number, to: number) => {
		setData((previous) => {
			if (to < 0 || to >= previous.length) return previous;
			const next = [...previous];
			const [item] = next.splice(from, 1);
			next.splice(to, 0, item);
			return next;
		});
	};

	return (
		<section className="space-y-3">
			<DemoTitle title="Row order extension" description="行排序不内置；外部维护 data 顺序即可。" />
			<DataGrid rowKey="id" columns={columns} data={data} scroll={{ x: 1400, y: 360 }} />
		</section>
	);
}
