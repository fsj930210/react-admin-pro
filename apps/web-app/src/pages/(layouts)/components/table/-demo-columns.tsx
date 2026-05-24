import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/service/table";
import type { DemoUser } from "./-demo-data";

export function createUserColumns(extra?: ColumnDef<DemoUser>[]): ColumnDef<DemoUser>[] {
	return [
		{
			accessorKey: "name",
			header: "Name",
			size: 180,
			enableSorting: true,
			enableColumnFilter: true,
			meta: {
				pinned: "left",
				ellipsis: true,
				sort: { key: "name" },
				filter: { key: "name", type: "input" },
			},
		},
		{
			accessorKey: "email",
			header: "Email",
			size: 240,
			enableColumnFilter: true,
			meta: { ellipsis: true, filter: { type: "input" } },
		},
		{
			accessorKey: "age",
			header: "Age",
			size: 100,
			enableSorting: true,
			meta: { sort: { key: "age" } },
		},
		{
			accessorKey: "department",
			header: "Department",
			size: 160,
			enableColumnFilter: true,
			meta: {
				filter: {
					type: "radio",
					options: ["Engineering", "Product", "Design", "Operations"].map((value) => ({
						label: value,
						value,
					})),
				},
			},
		},
		{ accessorKey: "position", header: "Position", size: 190, meta: { ellipsis: true } },
		{ accessorKey: "joinDate", header: "Join Date", size: 140 },
		{
			accessorKey: "salary",
			header: "Salary",
			size: 130,
			enableSorting: true,
			cell: ({ getValue }) => `$${Number(getValue()).toLocaleString()}`,
			meta: { sort: { key: "salary" } },
		},
		{
			accessorKey: "status",
			header: "Status",
			size: 130,
			enableColumnFilter: true,
			meta: {
				filter: {
					type: "checkbox",
					options: [
						{ label: "Active", value: "active" },
						{ label: "Vacation", value: "vacation" },
						{ label: "Left", value: "left" },
						{ label: "Probation", value: "probation" },
					],
				},
			},
		},
		{ accessorKey: "score", header: "Score", size: 110, enableSorting: true },
		...(extra ?? []),
	];
}

export function createRemoteUserColumns(): ColumnDef<User>[] {
	return [
		{
			accessorKey: "name",
			header: "姓名",
			size: 140,
			enableSorting: true,
			enableColumnFilter: true,
			meta: {
				pinned: "left",
				sort: { key: "name" },
				filter: { key: "name", type: "input" },
				ellipsis: true,
			},
		},
		{ accessorKey: "email", header: "邮箱", size: 220, meta: { ellipsis: true } },
		{
			accessorKey: "age",
			header: "年龄",
			size: 90,
			enableSorting: true,
			meta: { sort: { key: "age" } },
		},
		{
			accessorKey: "department",
			header: "部门",
			size: 130,
			enableColumnFilter: true,
			meta: { filter: { key: "department", type: "input" } },
		},
		{ accessorKey: "position", header: "职位", size: 130 },
		{ accessorKey: "phone", header: "电话", size: 160 },
		{ accessorKey: "joinDate", header: "入职日期", size: 130 },
		{
			accessorKey: "salary",
			header: "薪资",
			size: 120,
			enableSorting: true,
			meta: { sort: { key: "salary" } },
		},
		{ accessorKey: "status", header: "状态", size: 100 },
		{
			accessorKey: "score",
			header: "评分",
			size: 100,
			enableSorting: true,
			meta: { sort: { key: "score" } },
		},
	];
}
