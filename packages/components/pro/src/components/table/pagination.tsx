"use client"

import { useDataTable } from "./data-table"
import { Pagination, type PaginationProps } from "../pagination"


export function DataTablePagination({
	showSizeChanger = true,
	pageSizeOptions = [10, 20, 50, 100],
	showQuickJumper = false,
	total,
	page,
	pageSize,
	onShowSizeChange,
	onChange,
}: PaginationProps) {
	const { table } = useDataTable()
	const selectedCount = table.getFilteredSelectedRowModel().rows.length || 0
	const handlePageChange = (newPage: number, newPageSize: number) => {
		table.setPageIndex(newPage - 1)
		table.setPageSize(newPageSize)
		onChange?.(newPage, newPageSize)
	}

	const handlePageSizeChange = (current: number, size: number) => {
		table.setPageSize(size)
		table.setPageIndex(0)
		onShowSizeChange?.(current, size)
	}

	return (
		<Pagination
			className="p-2 border-t justify-between"
			contentClassName="justify-between"
			page={page}
			pageSize={pageSize}
			total={total}
			onChange={handlePageChange}
			onShowSizeChange={handlePageSizeChange}
			showSizeChanger={showSizeChanger}
			pageSizeOptions={pageSizeOptions}
			showQuickJumper={showQuickJumper}
			showTotal={(total) => (
				<div className="flex-1 text-sm text-muted-foreground">
					{selectedCount > 0
						? `已选择 ${selectedCount} 条，共 ${total} 条`
						: `共 ${total} 条`}
				</div>
			)}
		/>

	)
}
