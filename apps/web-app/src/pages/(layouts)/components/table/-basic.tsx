import { DataGrid } from "@rap/components-pro/data-grid";
import { Button } from "@rap/components-ui/button";
import type { ColumnDef, ColumnFiltersState, SortingState, Column, Table } from "@tanstack/react-table";
import { Minus, Edit, Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchUsers, type User } from "@/service/table";
import { Input } from "@rap/components-ui/input";

interface User {
	id: string
	name: string
	email: string
	role: string
	createdAt: string
}


export function BasicDataGrid() {
	const [users, setUsers] = useState<User[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [currentPageSize, setCurrentPageSize] = useState(50);
	const [localSearchValue] = useState("");

	// 薪资范围自定义筛选状态
	const [salaryMin, setSalaryMin] = useState("");
	const [salaryMax, setSalaryMax] = useState("");

	// 自定义薪资范围筛选渲染
	const renderSalaryFilter = (column: Column<User, unknown>, _table: Table<User>): React.ReactNode => {
		const handleApply = () => {
			if (salaryMin || salaryMax) {
				column.setFilterValue({ min: salaryMin, max: salaryMax });
			} else {
				column.setFilterValue(undefined);
			}
		};

		const handleReset = () => {
			setSalaryMin("");
			setSalaryMax("");
			column.setFilterValue(undefined);
		};

		return (
			<div className="p-2 space-y-2">
				<div className="flex items-center gap-2">
					<Input
						type="number"
						value={salaryMin}
						onChange={(e) => setSalaryMin(e.target.value)}
						className="h-6 text-xs w-20"
						placeholder="最小值"
					/>
					<Minus className="size-3 text-muted-foreground" />
					<Input
						type="number"
						value={salaryMax}
						onChange={(e) => setSalaryMax(e.target.value)}
						className="h-6 text-xs w-20"
						placeholder="最大值"
					/>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="h-6 text-xs flex-1"
						onClick={handleApply}
					>
						应用
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-6 text-xs flex-1"
						onClick={handleReset}
					>
						重置
					</Button>
				</div>
			</div>
		);
	};

	// biome-ignore lint:correctness/useExhaustiveDependencies
	const columns: ColumnDef<User>[] = useMemo(() => [
		{
			accessorKey: "user_id",
			header: "ID",
			meta: { title: "ID", },
			enableSorting: false,
		},
		{
			id: 'hello',
			header: () => <span>信息</span>,
			columns: [

				{
					accessorKey: "name",
					header: "姓名",
					meta: {
						title: "姓名",
						filterType: "input" as const,
						enableLocalFilter: false, // 远程搜索
						pinning: 'left',
					},
					enableColumnFilter: true,
					enableResizing: true,
					size: 150,
				},
				{
					accessorKey: "email",
					header: "邮箱",
					meta: {
						title: "邮箱",
						filterType: "input" as const,
						enableLocalFilter: false, // 远程搜索
					},
					enableColumnFilter: true,
					enableSorting: false,
				},
				{
					accessorKey: "age",
					header: "年龄",
					meta: {
						title: "年龄",
						filterType: "radio" as const,
						enableLocalFilter: false, // 远程搜索
						filterOptions: [
							{ label: "18-25", value: "young" },
							{ label: "26-35", value: "middle" },
							{ label: "36-50", value: "old" },
							{ label: "50+", value: "senior" },
						],
					},
					enableColumnFilter: true,
				},
			],
		},


		{
			accessorKey: "department",
			header: "部门",
			meta: {
				title: "部门",
				filterType: "radio" as const,
				enableLocalFilter: false, // 远程搜索
				filterOptions: [
					{ label: "技术部", value: "tech" },
					{ label: "产品部", value: "product" },
					{ label: "设计部", value: "design" },
					{ label: "运营部", value: "operation" },
				],
			},
			enableColumnFilter: true,
			enableResizing: true,
			size: 120,
		},
		{
			accessorKey: "position",
			header: "职位",
			meta: {
				title: "职位",
				filterType: "input" as const,
				enableLocalFilter: false, // 远程搜索
			},
			enableColumnFilter: true,
		},
		{
			accessorKey: "phone",
			header: "电话",
			meta: { title: "电话" },
			enableSorting: false,
			enableResizing: true,
		},
		{
			accessorKey: "address",
			header: "地址",
			meta: { title: "地址" },
			enableSorting: false,
		},
		{
			accessorKey: "joinDate",
			header: "入职日期",
			meta: { title: "入职日期" },
		},
		{
			accessorKey: "salary",
			header: "薪资",
			meta: {
				title: "薪资",
				filterType: "custom" as const,
				enableLocalFilter: false, // 远程搜索
			},
			enableColumnFilter: true,
		},
		{
			accessorKey: "status",
			header: "状态",
			meta: {
				title: "状态",
				filterType: "checkbox" as const,
				enableLocalFilter: false, // 远程搜索
				filterOptions: [
					{ label: "在职", value: "active" },
					{ label: "休假", value: "vacation" },
					{ label: "离职", value: "left" },
					{ label: "试用期", value: "probation" },
				],
			},
			enableColumnFilter: true,
		},
		{
			accessorKey: "score",
			header: "评分",
			meta: {
				title: "评分",
				enableLocalSort: true,
				enableLocalFilter: true, // 本地搜索，不调用接口
				filterType: "input" as const,
			},
			enableColumnFilter: true,
			sortingFn: (rowA, rowB) => {
				const scoreA = rowA.original.score;
				const scoreB = rowB.original.score;
				return scoreA - scoreB;
			},
			filterFn: (row, _, filterValue) => {
				const score = row.original.score;
				const filter = parseFloat(filterValue as string);
				return !isNaN(filter) && score >= filter;
			},
		},
		{
			id: "action",
			header: () => <span className="text-center">操作</span>,
			cell: () => (
				<div className="flex items-center justify-center gap-2">
					<Button variant="ghost" size="icon" className="h-8 w-8">
						<Edit className="h-4 w-4" />
					</Button>
					<Button variant="ghost" size="icon" className="h-8 w-8">
						<Eye className="h-4 w-4" />
					</Button>
				</div>
			),
			meta: {
				title: "操作",
				pinning: 'right',
			},
			enableSorting: false,
			enableColumnFilter: false,
		},
	], []);

	const loadData = async (
		page = currentPage,
		pageSize = currentPageSize,
		sorting?: SortingState,
		filtering?: ColumnFiltersState,
	) => {
		setLoading(true);
		try {
			const sortFields = sorting?.map(s => ({
				field: s.id,
				order: s.desc ? "desc" : "asc",
			}));

			const filters: Record<string, unknown> = {};
			if (filtering && filtering.length > 0) {
				filtering.forEach(filter => {
					if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
						filters[filter.id] = filter.value;
					}
				});
			}

			const response = await fetchUsers({
				page,
				pageSize,
				sortFields,
				filters: Object.keys(filters).length > 0 ? filters : undefined,
			});
			if (response.data) {
				setUsers(response.data.data);
				setTotal(response.data.pagination.total);
			}
		} catch (error) {
			console.error("Failed to fetch users:", error);
		} finally {
			setLoading(false);
		}
	};

	// 全局本地搜索过滤
	const filteredUsers = users.filter(user => {
		if (!localSearchValue) return true;
		const searchLower = localSearchValue.toLowerCase();
		return (
			user.name.toLowerCase().includes(searchLower) ||
			user.email.toLowerCase().includes(searchLower) ||
			user.department.toLowerCase().includes(searchLower) ||
			user.position.toLowerCase().includes(searchLower)
		);
	});

	// biome-ignore lint:correctness/useExhaustiveDependencies
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		loadData();
	}, []);

	const handleSortChange = (sorting: SortingState, currentSortColumn: Column<User, unknown>) => {
		console.log("排序改变了:", sorting, "变化的列:", currentSortColumn);
		const columnMeta = currentSortColumn.columnDef.meta as { enableLocalSort?: boolean };
		if (columnMeta?.enableLocalSort) return;
		const backendSorting = sorting?.filter(sortItem => {
			const col = columns.find(c => c.id === sortItem.id);
			const columnMeta = col?.meta as { enableLocalSort?: boolean };
			return !(columnMeta?.enableLocalSort);
		});
		loadData(currentPage, currentPageSize, backendSorting);
	};

	const handleFilterChange = (filtering: ColumnFiltersState, currentFilterColumn: Column<User, unknown>) => {
		console.log("筛选改变了:", filtering, "变化的列:", currentFilterColumn);

		// 检查是否是本地筛选列
		const columnMeta = currentFilterColumn?.columnDef.meta as { enableLocalFilter?: boolean };
		if (columnMeta?.enableLocalFilter) return;

		// 远程筛选，调用接口
		loadData(1, currentPageSize, undefined, filtering);
	};

	const handlePageChange = (page: number, pageSize: number) => {
		console.log("页码改变了:", page, pageSize);
		setCurrentPage(page);
		setCurrentPageSize(pageSize);
		loadData(page, pageSize);
	};

	return (
		<DataGrid
			// border
			rowKey="user_id"
			columns={columns}
			data={localSearchValue ? filteredUsers : users}
			scroll={{
				x: 1200,
				y: 500,
			}}
			columnResizing={{
				enable: true,
			}}
			columnOrder={{
				enable: true,
				enableDragOrder: true,
			}}
		/>
	);
}
