import React from "react"
import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@rap/components-ui/pagination"

/**
 * 分页组件属性接口
 * @example
 * ```tsx
 * <Pagination
 *   current={1}
 *   pageSize={10}
 *   total={100}
 *   onChange={(page, pageSize) => console.log(page, pageSize)}
 *   showSizeChanger
 *   showQuickJumper
 *   showTotal={(total, [start, end]) => `共 ${total} 条`}
 * />
 * ```
 */
export interface PaginationProps {
  /** 当前页码，从 1 开始 */
  current?: number
  /** 每页条数 */
  pageSize?: number
  /** 数据总条数 */
  total?: number
  /** 页码或每页条数改变时的回调 */
  onChange?: (page: number, pageSize: number) => void
  /** 每页条数改变时的回调 */
  onShowSizeChange?: (current: number, size: number) => void
  /** 每页条数选项列表 */
  pageSizeOptions?: number[]
  /** 是否显示每页条数选择器 */
  showSizeChanger?: boolean
  /** 是否显示快速跳转输入框 */
  showQuickJumper?: boolean
  /** 显示总数的渲染函数 */
  showTotal?: (total: number, range: [number, number]) => React.ReactNode
  /** 是否禁用分页组件 */
  disabled?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 是否显示首页末页按钮 */
  showFirstLast?: boolean
}

const Pagination = ({
  current = 1,
  pageSize = 10,
  total = 0,
  onChange,
  onShowSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showSizeChanger = false,
  showQuickJumper = false,
  showTotal,
  disabled = false,
  className,
  showFirstLast = false,
}: PaginationProps) => {
  /** 计算总页数 */
  const totalPages = Math.ceil(total / pageSize)
  /** 页码数组，包含数字或省略号标记 */
  const pages: (number | string)[] = []

  /** 是否有上一页 */
  const hasPrev = current > 1
  /** 是否有下一页 */
  const hasNext = current < totalPages

  /** 邻近页码数量（左右各显示的页码数） */
  const siblingCount = 1
  /** 边界页码数量（首尾各显示的页码数） */
  const boundaryCount = 1

  /** 生成页码数组，使用省略号优化长列表显示 */
  if (totalPages <= 7) {
    /** 总页数不超过7时，显示所有页码 */
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    /** 总页数超过7时，使用省略号优化 */
    pages.push(1)

    const leftSibling = Math.max(current - siblingCount, boundaryCount + 1)
    const rightSibling = Math.min(current + siblingCount, totalPages - boundaryCount)

    if (leftSibling > boundaryCount + 1) {
      pages.push("ellipsis")
    }

    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i)
      }
    }

    if (rightSibling < totalPages - boundaryCount) {
      pages.push("ellipsis")
    }

    pages.push(totalPages)
  }

  /** 处理页码点击事件 */
  const handlePageChange = (page: number) => {
    if (page === current || disabled) return
    onChange?.(page, pageSize)
  }

  /** 处理首页点击 */
  const handleFirst = () => {
    if (current === 1 || disabled) return
    onChange?.(1, pageSize)
  }

  /** 处理末页点击 */
  const handleLast = () => {
    if (current === totalPages || disabled) return
    onChange?.(totalPages, pageSize)
  }

  /** 处理每页条数选择变更 */
  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value)
    onShowSizeChange?.(current, newSize)
  }

  /** 处理快速跳转输入变更 */
  const handleJumpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const jumpPage = Number(e.target.value)
    if (jumpPage >= 1 && jumpPage <= totalPages && jumpPage !== current) {
      onChange?.(jumpPage, pageSize)
    }
  }

  /** 当前页显示的起始序号 */
  const startIndex = (current - 1) * pageSize + 1
  /** 当前页显示的结束序号 */
  const endIndex = Math.min(current * pageSize, total)

  return (
    <UIPagination className={className}>
      <PaginationContent className="flex flex-wrap items-center gap-2">
        {showTotal && total > 0 && (
          <span className="text-sm text-muted-foreground">
            {showTotal(total, [startIndex, endIndex])}
          </span>
        )}

        {showSizeChanger && (
          <select
            value={pageSize}
            onChange={handleSizeChange}
            disabled={disabled}
            className="h-8 w-auto rounded-md border border-input bg-background px-2 py-1 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        )}

        {showFirstLast && (
          <PaginationItem>
            <PaginationLink
              disabled={!hasPrev || disabled}
              onClick={handleFirst}
              className="px-2"
            >
              first
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationPrevious
            disabled={!hasPrev || disabled}
            onClick={() => handlePageChange(current - 1)}
          />
        </PaginationItem>

        {pages.map((page, index) => (
          <PaginationItem key={index}>
            {page === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={page === current}
                disabled={disabled}
                onClick={() => handlePageChange(page as number)}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            disabled={!hasNext || disabled}
            onClick={() => handlePageChange(current + 1)}
          />
        </PaginationItem>

        {showFirstLast && (
          <PaginationItem>
            <PaginationLink
              disabled={!hasNext || disabled}
              onClick={handleLast}
              className="px-2"
            >
              last
            </PaginationLink>
          </PaginationItem>
        )}

        {showQuickJumper && totalPages > 0 && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>跳至</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={current}
              onChange={handleJumpChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const jumpPage = Number(e.currentTarget.value)
                  if (jumpPage >= 1 && jumpPage <= totalPages) {
                    onChange?.(jumpPage, pageSize)
                  }
                }
              }}
              disabled={disabled}
              className="h-8 w-16 rounded-md border border-input bg-background px-2 py-1 text-center text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
            />
            <span>页，共 {totalPages} 页</span>
          </span>
        )}
      </PaginationContent>
    </UIPagination>
  )
}

Pagination.displayName = "Pagination"

export { Pagination }
