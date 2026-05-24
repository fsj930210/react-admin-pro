import { DataGrid } from "@rap/components-pro/data-grid";
import { Button } from "@rap/components-ui/button";
import { Input } from "@rap/components-ui/input";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createDemoUsers, type DemoUser } from "./-demo-data";

const editableFields = new Set<keyof DemoUser>([
	"name",
	"email",
	"age",
	"department",
	"position",
	"joinDate",
	"salary",
	"status",
	"score",
]);

export function EditableRowDataGridDemo() {
	const [data, setData] = useState(() => createDemoUsers(16));
	const [editingId, setEditingId] = useState<string | null>(null);
	const update = (id: string, field: keyof DemoUser, value: unknown) => {
		setData((previous) =>
			previous.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
		);
	};
	const columns = useMemo<ColumnDef<DemoUser>[]>(
		() =>
			createUserColumns([
				{
					id: "action",
					header: "Action",
					size: 120,
					cell: ({ row }) => (
						<Button
							size="sm"
							variant="outline"
							onClick={() => setEditingId(editingId === row.original.id ? null : row.original.id)}
						>
							{editingId === row.original.id ? "Done" : "Edit"}
						</Button>
					),
				},
			]),
		[editingId],
	);

	return (
		<section className="space-y-3">
			<DemoTitle
				title="Editable row extension"
				description="点击 Edit 后直接在单元格输入，输入时更新外部 data，Done 退出编辑态。"
			/>
			<DataGrid
				rowKey="id"
				columns={columns}
				data={data}
				scroll={{ x: 1400, y: 360 }}
				onCell={(record, _index, ctx) => {
					const field = ctx.column.id as keyof DemoUser;
					if (editingId !== record.id || !editableFields.has(field)) return {};
					const type = typeof ctx.cell.getValue() === "number" ? "number" : "text";
					return {
						children: (
							<Input
								className="h-8"
								type={type}
								value={String(ctx.cell.getValue() ?? "")}
								onChange={(event) =>
									update(
										record.id,
										field,
										type === "number" ? Number(event.target.value) : event.target.value,
									)
								}
							/>
						),
					} as never;
				}}
			/>
		</section>
	);
}
