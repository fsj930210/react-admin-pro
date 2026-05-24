import { DataGrid } from "@rap/components-pro/data-grid";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { type FetchUsersParams, fetchUsers, type User } from "@/service/table";
import { DemoTitle } from "./-basic";
import { createRemoteUserColumns } from "./-demo-columns";

export function RemoteDataGridDemo() {
	const columns = useMemo(() => createRemoteUserColumns(), []);
	const [data, setData] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	useEffect(() => {
		const params: FetchUsersParams = {
			page,
			pageSize,
			sortFields: sorting.map((item) => ({ field: item.id, order: item.desc ? "desc" : "asc" })),
			filters: Object.fromEntries(columnFilters.map((item) => [item.id, item.value])),
		};
		const firstFilter = columnFilters[0];
		const compatParams = firstFilter
			? { ...params, filterField: firstFilter.id, filterValue: String(firstFilter.value ?? "") }
			: params;

		setLoading(true);
		fetchUsers(compatParams as FetchUsersParams)
			.then((response) => {
				const payload = response as unknown as
					| { data?: User[]; pagination?: { total?: number } }
					| User[];
				const nextData = Array.isArray(payload) ? payload : (payload.data ?? []);
				setData(nextData);
				setTotal(
					Array.isArray(payload) ? nextData.length : (payload.pagination?.total ?? nextData.length),
				);
			})
			.finally(() => setLoading(false));
	}, [columnFilters, page, pageSize, sorting]);

	return (
		<section className="space-y-3">
			<DemoTitle
				title="Remote data"
				description="使用 service/table.ts 的 fetchUsers，DataGrid 只负责状态回调。"
			/>
			<DataGrid
				rowKey="id"
				columns={columns}
				data={data}
				loading={loading}
				scroll={{ x: 1300, y: 420 }}
				columnSizing={{}}
				sorting={{ value: sorting, onChange: setSorting }}
				filtering={{ columnFilters, onColumnFiltersChange: setColumnFilters }}
				pagination={{
					page,
					pageSize,
					total,
					showSizeChanger: true,
					onChange: (nextPage, nextPageSize) => {
						setPage(nextPage);
						setPageSize(nextPageSize);
					},
					showTotal: (count) => `共 ${count} 条`,
				}}
			/>
		</section>
	);
}
