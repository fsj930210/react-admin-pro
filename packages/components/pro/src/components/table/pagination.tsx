import { type Table } from "@tanstack/react-table"

import { Pagination } from "../pagination"

/**
 * 表格分页组件属性接口
 * @example
 * ```tsx
 * const table = useReactTable({ ... })
 * <DataTablePagination table={table} />
 * ```
 */
export interface DataTablePaginationProps<TData> {
  /** TanStack Table 实例 */
  table: Table<TData>
  /** 是否显示每页条数选择器 */
  showSizeChanger?: boolean
  /** 每页条数选项列表 */
  pageSizeOptions?: number[]
  /** 是否显示快速跳转输入框 */
  showQuickJumper?: boolean
  /** 是否显示首页末页按钮 */
  showFirstLast?: boolean
}

export function DataTablePagination<TData>({
  table,
  showSizeChanger = true,
  pageSizeOptions = [10, 20, 25, 30, 40, 50],
  showQuickJumper = false,
  showFirstLast = true,
}: DataTablePaginationProps<TData>) {
  /** 当前页码（从 0 开始，需要 +1 显示） */
  const currentPage = table.getState().pagination.pageIndex + 1
  /** 每页条数 */
  const pageSize = table.getState().pagination.pageSize
  /** 总数据条数（过滤后的） */
  const total = table.getFilteredRowModel().rows.length
  /** 已选择的数据条数 */
  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  /** 处理页码改变 */
  const handlePageChange = (page: number) => {
    table.setPageIndex(page - 1)
  }

  /** 处理每页条数改变 */
  const handlePageSizeChange = (_: number, size: number) => {
    table.setPageSize(size)
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {selectedCount > 0
          ? `${selectedCount} of ${total} row(s) selected.`
          : `${total} row(s) total.`}
      </div>

      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={total}
        onChange={handlePageChange}
        onShowSizeChange={handlePageSizeChange}
        showSizeChanger={showSizeChanger}
        pageSizeOptions={pageSizeOptions}
        showQuickJumper={showQuickJumper}
        showFirstLast={showFirstLast}
      />
    </div>
  )
}
