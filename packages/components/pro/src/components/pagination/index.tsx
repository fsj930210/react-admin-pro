import { type ChangeEvent, type ReactNode } from "react";
import { useControllableState } from "@rap/hooks/use-controllable-state";
import { useTranslation } from "@rap/i18n";
import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@rap/components-ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rap/components-ui/select";
import { Input } from "@rap/components-ui/input";
import { cn } from "@rap/utils";
import * as React from "react";

/**
 * 分页组件属性接口
 * @example
 * ```tsx
 * <Pagination
 *   page={1}
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
  page?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 数据总条数 */
  total?: number;
  /** 每页条数选项列表 */
  pageSizeOptions?: number[];
  /** 是否显示每页条数选择器 */
  showSizeChanger?: boolean;
  /** 是否显示快速跳转输入框 */
  showQuickJumper?: boolean;
  /** 是否禁用分页组件 */
  disabled?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 是否隐藏单页 */
  hideOnSinglePage?: boolean;
  /** 默认页码 */
  defaultPage?: number;
  /** 默认每页条数 */
  defaultPageSize?: number;
  /** 页码或每页条数改变时的回调 */
  onChange?: (page: number, pageSize: number) => void;
  /** 每页条数改变时的回调 */
  onShowSizeChange?: (current: number, size: number) => void;
  /** 显示总数的渲染函数 */
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  /** 自定义页码渲染函数 */
  itemRender?: (
    page: number,
    type: "page" | "prev" | "next",
    originalElement: React.ReactNode
  ) => React.ReactNode;
  contentClassName?: string;
}

const Pagination = ({
  page,
  pageSize,
  total = 0,
  pageSizeOptions = [10, 20, 50, 100],
  showSizeChanger,
  showQuickJumper = false,
  disabled = false,
  className,
  contentClassName,
  defaultPage = 1,
  defaultPageSize = 10,
  onChange,
  onShowSizeChange,
  showTotal,
  itemRender,
  hideOnSinglePage,
}: PaginationProps) => {
  const { t } = useTranslation("pro");

  if (total === 0) return null;

  if (hideOnSinglePage && Math.ceil(total / (pageSize || defaultPageSize)) <= 1) return null;

  const showSizeChangerFinal = showSizeChanger !== undefined ? showSizeChanger : total > 50;

  const [current, setCurrent] = useControllableState<number>({
    value: page,
    defaultValue: defaultPage,
  });

  const [pageSizeValue, setPageSizeValue] = useControllableState<number>({
    value: pageSize,
    defaultValue: defaultPageSize,
  });

  /** 计算总页数 */
  const totalPages = Math.ceil(total / pageSizeValue);
  /** 页码数组，包含数字或省略号标记 */
  const pages: (number | string)[] = [];

  /** 是否有上一页 */
  const hasPrev = current > 1;
  /** 是否有下一页 */
  const hasNext = current < totalPages;

  /** 邻近页码数量（左右各显示的页码数） */
  const siblingCount = 2;

  /** 生成页码数组，使用省略号优化长列表显示 */
  if (totalPages <= 7) {
    /** 总页数不超过7时，显示所有页码 */
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    /** 总页数超过7时，使用省略号优化 */
    pages.push(1);

    /** 计算左边界（不包括首页） */
    const leftBoundary = Math.max(current - siblingCount, 2);
    /** 计算右边界（不包括末页） */
    const rightBoundary = Math.min(current + siblingCount, totalPages - 1);

    /** 如果左边有空隙，添加省略号 */
    if (leftBoundary > 2) {
      pages.push("ellipsis");
    }

    /** 添加中间的页码 */
    for (let i = leftBoundary; i <= rightBoundary; i++) {
      pages.push(i);
    }

    /** 如果右边有空隙，添加省略号 */
    if (rightBoundary < totalPages - 1) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);
  }

  /** 处理页码点击事件 */
  const handlePageChange = (newPage: number) => {
    if (newPage === current || disabled) return;
    setCurrent(newPage);
    onChange?.(newPage, pageSizeValue);
  };

  /** 处理每页条数选择变更 */
  const handlePageSizeChange = (value: string) => {
    const newSize = Number(value);
    setPageSizeValue(newSize);

    // 计算新的总页数
    const newTotalPages = Math.max(1, Math.ceil(total / newSize));
    // 如果当前页超过新的总页数，调整到最后一页
    const newCurrent = Math.min(current, newTotalPages);

    onShowSizeChange?.(newCurrent, newSize);
    onChange?.(newCurrent, newSize);
  };

  /** 处理快速跳转输入变更 */
  const handleJumpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const jumpPage = Number(e.target.value);
    if (jumpPage >= 1 && jumpPage <= totalPages && jumpPage !== current) {
      setCurrent(jumpPage);
      onChange?.(jumpPage, pageSizeValue);
    }
  };

  /** 当前页显示的起始序号 */
  const startIndex = (current - 1) * pageSizeValue + 1;
  /** 当前页显示的结束序号 */
  const endIndex = Math.min(current * pageSizeValue, total);

  return (
    <UIPagination className={className}>
      {showTotal && total > 0 && (
        <span className="text-sm text-muted-foreground">
          {showTotal(total, [startIndex, endIndex])}
        </span>
      )}
      <PaginationContent className={cn("flex-wrap gap-2", contentClassName)}>
        <PaginationItem>
          {itemRender ? (
            itemRender(
              current - 1,
              "prev",
              <PaginationPrevious
                disabled={!hasPrev || disabled}
                onClick={() => handlePageChange(current - 1)}
                title={t("pagination.previous")}
                aria-label={t("pagination.previous")}
              />
            )
          ) : (
            <PaginationPrevious
              disabled={!hasPrev || disabled}
              onClick={() => handlePageChange(current - 1)}
              title={t("pagination.previous")}
              aria-label={t("pagination.previous")}
            />
          )}
        </PaginationItem>

        {pages.map((pageItem, index) => (
          <PaginationItem key={index}>
            {pageItem === "ellipsis" ? (
              <PaginationEllipsis />
            ) : itemRender ? (
              itemRender(
                pageItem as number,
                "page",
                <PaginationLink
                  isActive={pageItem === current}
                  disabled={disabled}
                  onClick={() => handlePageChange(pageItem as number)}
                  title={t("pagination.page", { page: pageItem })}
                  aria-label={`${t("pagination.page", { page: pageItem })}${
                    pageItem === current ? t("pagination.currentPage") : ""
                  }`}
                >
                  {pageItem}
                </PaginationLink>
              )
            ) : (
              <PaginationLink
                isActive={pageItem === current}
                disabled={disabled}
                onClick={() => handlePageChange(pageItem as number)}
                title={t("pagination.page", { page: pageItem })}
                aria-label={`${t("pagination.page", { page: pageItem })}${
                  pageItem === current ? t("pagination.currentPage") : ""
                }`}
              >
                {pageItem}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          {itemRender ? (
            itemRender(
              current + 1,
              "next",
              <PaginationNext
                disabled={!hasNext || disabled}
                onClick={() => handlePageChange(current + 1)}
                title={t("pagination.next")}
                aria-label={t("pagination.next")}
              />
            )
          ) : (
            <PaginationNext
              disabled={!hasNext || disabled}
              onClick={() => handlePageChange(current + 1)}
              title={t("pagination.next")}
              aria-label={t("pagination.next")}
            />
          )}
        </PaginationItem>

        {showSizeChangerFinal && (
          <Select
            value={String(pageSizeValue)}
            onValueChange={handlePageSizeChange}
            disabled={disabled}
          >
            <SelectTrigger size="sm" className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {t("pagination.pageSize", { size })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {showQuickJumper && totalPages > 0 && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t("pagination.jumpTo")}</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={current}
              onChange={handleJumpChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const jumpPage = Number((e.target as HTMLInputElement).value);
                  if (jumpPage >= 1 && jumpPage <= totalPages) {
                    setCurrent(jumpPage);
                    onChange?.(jumpPage, pageSizeValue);
                  }
                }
              }}
              disabled={disabled}
              className="w-16 text-center"
            />
            <span>{t("pagination.totalPages", { total: totalPages })}</span>
          </span>
        )}
      </PaginationContent>
    </UIPagination>
  );
};

Pagination.displayName = "Pagination";

export { Pagination };
