import { DataGrid } from "@rap/components-pro/data-grid";
import { Input } from "@rap/components-ui/input";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createDemoUsers, type DemoUser } from "./-demo-data";

export function EditableCellDataGridDemo() {
	const [data, setData] = useState(() => createDemoUsers(20));
	const [editing, setEditing] = useState<string | null>(null);
	const columns = useMemo<ColumnDef<DemoUser>[]>(
		() =>
			createUserColumns([
				{
					id: "scoreEditor",
					header: "Score editor",
					accessorKey: "score",
					size: 140,
					cell: ({ row, getValue }) => {
						const key = `${row.id}:scoreEditor`;
						if (editing !== key) return getValue<number>();
						return (
							<Input
								autoFocus
								className="h-8"
								type="number"
								defaultValue={getValue<number>()}
								onBlur={(event) => {
									const score = Number(event.target.value);
									setData((previous) =>
										previous.map((item) =>
											item.id === row.original.id ? { ...item, score } : item,
										),
									);
									setEditing(null);
								}}
							/>
						);
					},
				},
			]),
		[editing],
	);

	return (
		<section className="space-y-3">
			<DemoTitle
				title="Editable cell extension"
				description="编辑能力不内置；通过自定义 cell 和外部 editing key 实现。"
			/>
			<DataGrid
				rowKey="id"
				columns={columns}
				data={data}
				scroll={{ x: 1400, y: 360 }}
				onCell={(_record, _index, ctx) => ({
					onDoubleClick: () => setEditing(`${ctx.row.id}:${ctx.column.id}`),
				})}
			/>
		</section>
	);
}
