import { createFileRoute } from "@tanstack/react-router";
import {
	DataTable,
	RowSelectionColumn,
	DataTablePagination,
	DataTableViewOptions
} from "@rap/components-pro/table";
import {
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	type ColumnDef,
	type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@rap/components-ui/button";
import { DropdownMenu } from "@rap/components-ui/dropdown-menu";
import { DropdownMenuContent } from "@rap/components-ui/dropdown-menu";
import { DropdownMenuTrigger } from "@rap/components-ui/dropdown-menu";

export const Route = createFileRoute("/(layouts)/components/table/")({
	component: TableDemo,
});

interface User {
	id: string;
	name: string;
	email: string;
	age: number;
}

const mockUsers: User[] = Array.from({ length: 100 }, (_, i) => ({
	id: String(10000 + i),
	name: ["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十"][i % 8],
	email: `user${i}@example.com`,
	age: 20 + Math.floor(Math.random() * 40),
}));

function TableDemo() {
	const columns: ColumnDef<User>[] = [
		...RowSelectionColumn<User>(),
		{
			accessorKey: "id",
			header: "ID",
		},
		{
			accessorKey: "name",
			header: "姓名",
		},
		{
			accessorKey: "email",
			header: "邮箱",
		},
		{
			accessorKey: "age",
			header: "年龄",
		},
	];

	const [data] = useState(mockUsers);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			columnVisibility,
			rowSelection,
		},
	});

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6">表格组件演示</h1>

			<div className="bg-card rounded-lg border overflow-hidden">
				<div className="flex items-center justify-between px-4 py-3 border-b">
					<div className="text-sm text-muted-foreground">用户管理</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="icon">
								<Eye className="size-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DataTableViewOptions table={table} />
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<DataTable columns={columns} data={data} />

			</div>
		</div>
	);
}