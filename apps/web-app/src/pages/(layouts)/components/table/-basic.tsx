import {
	DataTable,
	DataTableColumnHeader,
} from "@rap/components-pro/table";
import { Button } from "@rap/components-ui/button";

import type { ColumnDef, ColumnFiltersState, SortingState, Column, Table } from "@tanstack/react-table";
import { Minus, Edit, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchUsers, type User } from "@/service/table";
import { Input } from "@rap/components-ui/input";



export function BasicTable() {
	const [users, setUsers] = useState<User[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [currentPageSize, setCurrentPageSize] = useState(10);
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

	const columns: ColumnDef<User>[] = [
		{
			accessorKey: "id",
			header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="ID" />,
			meta: { title: "ID", },
			enableSorting: false,
		},
		{
			accessorKey: "name",
			header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="姓名" />,
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
			header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="邮箱" />,
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
			header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="年龄" />,
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
		{
			accessorKey: "department",
			header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="部门" />,
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
			header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="职位" />,
			meta: {
				title: "职位",
				filterType: "input" as const,
				enableLocalFilter: false, // 远程搜索
			},
			enableColumnFilter: true,
		},
		{
			accessorKey: "phone",
			header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="电话" />,
			meta: { title: "电话" },
			enableSorting: false,
			enableResizing: true,
		},
		{
			accessorKey: "address",
			header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="地址" />,
			meta: { title: "地址" },
			enableSorting: false,
		},
		{
			accessorKey: "joinDate",
			header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="入职日期" />,
			meta: { title: "入职日期" },
		},
		{
			accessorKey: "salary",
			header: ({ column }) => (
				<DataTableColumnHeader<User, unknown>
					column={column}
					title="薪资"
					filterProps={{ column, customRender: renderSalaryFilter }}
				/>
			),
			meta: {
				title: "薪资",
				filterType: "custom" as const,
				enableLocalFilter: false, // 远程搜索
			},
			enableColumnFilter: true,
		},
		{
			accessorKey: "status",
			header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="状态" />,
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
			header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="评分" />,
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
	];

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
		<DataTable
			rowKey="user_id"
			columns={columns}
			data={localSearchValue ? filteredUsers : users}
			columnConfig={{
				sorting: {
					enableMultiSort: true,
					maxMultiSortColCount: 3,
					enableSortingRemoval: true,
					onChange: handleSortChange,
				},
				order: {
					enable: true,
				},
				filter: {
					onChange: handleFilterChange,
				},
				rowSelection: {
					enable: true,
					type: 'checkbox',
					title: '',
					pinning: 'left',
					onChange: (selectedKeys, selectedRows) => {
						console.log('选中的行:', selectedKeys, selectedRows);
					},
					onSelect: (row, selected, selectedRows) => {
						console.log('选择行:', row, selected, selectedRows);
					},
					onSelectAll: (selected, selectedRows, changeRows) => {
						console.log('全选:', selected, selectedRows, changeRows);
					},
				},

			}}
			rowConfig={{
				order: {
					enable: true,
				}
			}}
			loading={loading}
			getSubRowData={(user) => {
				const userId = parseInt(user.id);
				const types = ["日志", "操作", "通知", "警告"];
				const contents = [
					`${user.name} 登录系统`,
					`${user.name} 更新了个人资料`,
					`${user.name} 查看了报表`,
					`${user.name} 导出了数据`,
					`${user.name} 修改了密码`,
					`系统消息已发送给 ${user.name}`,
					`${user.name} 密码即将过期`,
					`${user.name} 的账户已登录新设备`,
				];
				const times = ["09:15", "10:30", "11:45", "14:20", "15:30", "16:45", "17:00", "18:30"];

				const subRows: { id: string; type: string; content: string; time: string }[] = [];
				const count = userId % 4 + 2;

				for (let i = 0; i < count; i++) {
					subRows.push({
						id: `${user.id}-${i}`,
						type: types[(userId + i) % types.length],
						content: contents[(userId + i) % contents.length],
						time: times[(userId + i) % times.length],
					});
				}

				return subRows;
			}}
			renderSubRow={(user, subRowData) => (
				<div className="bg-muted/30 p-4">
					<div className="text-sm font-medium text-muted-foreground mb-2">{user.name} 的活动记录</div>
					<div className="space-y-2">
						{(subRowData as { id: string; type: string; content: string; time: string }[]).map((item) => (
							<div key={item.id} className="flex items-center gap-3 text-sm">
								<span className={`px-2 py-0.5 rounded text-xs ${item.type === "日志" ? "bg-blue-100 text-blue-700" :
									item.type === "操作" ? "bg-green-100 text-green-700" :
										item.type === "通知" ? "bg-orange-100 text-orange-700" :
											"bg-red-100 text-red-700"
									}`}>
									{item.type}
								</span>
								<span className="flex-1">{item.content}</span>
								<span className="text-muted-foreground">{item.time}</span>
							</div>
						))}
					</div>
				</div>
			)}
			pagination={{
				total: localSearchValue ? filteredUsers.length : total,
				onChange: (page, pageSize) => {
					console.log(page, pageSize, 'web-app table pagination');
					handlePageChange(page, pageSize);
				},
			}}
		/>
	);
}
