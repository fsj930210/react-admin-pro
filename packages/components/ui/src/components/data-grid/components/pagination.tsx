import { When } from "@rap/components-ui/when";
import { cn } from "@rap/utils";
import type { Table } from "@tanstack/react-table";
import type * as React from "react";
import { Input } from "../../input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select";
import type { DataGridPaginationConfig } from "../types";

interface DataGridPaginationProps<TData> {
  table: Table<TData>;
  config?: DataGridPaginationConfig | false;
  total?: number;
  loading?: boolean;
}

function getFallbackTotal<TData>(table: Table<TData>, mode: DataGridPaginationConfig["mode"]) {
  const totals = {
    local: table.getFilteredRowModel().rows.length,
    remote: table.getRowModel().rows.length,
  };

  return totals[mode ?? "remote"];
}

function getPaginationItems(current: number, totalPages: number) {
  const siblingCount = 2;
  const pages: (number | "ellipsis")[] = [];

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page++) {
      pages.push(page);
    }

    return pages;
  }

  pages.push(1);

  const leftBoundary = Math.max(current - siblingCount, 2);
  const rightBoundary = Math.min(current + siblingCount, totalPages - 1);

  if (leftBoundary > 2) {
    pages.push("ellipsis");
  }

  for (let page = leftBoundary; page <= rightBoundary; page++) {
    pages.push(page);
  }

  if (rightBoundary < totalPages - 1) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

export function DataGridPagination<TData>({
  table,
  config,
  total,
  loading,
}: DataGridPaginationProps<TData>) {
  const paginationConfig = config || {};
  const state = table.getState().pagination;
  const resolvedTotal =
    paginationConfig.total ?? total ?? getFallbackTotal(table, paginationConfig.mode);
  const current = state.pageIndex + 1;
  const pageSize = state.pageSize;
  const totalPages = Math.max(1, Math.ceil(resolvedTotal / pageSize));
  const startIndex = resolvedTotal === 0 ? 0 : state.pageIndex * pageSize + 1;
  const endIndex = Math.min(current * pageSize, resolvedTotal);
  const disabled = paginationConfig.disabled || loading;
  const showSizeChanger =
    paginationConfig.showSizeChanger !== undefined
      ? paginationConfig.showSizeChanger
      : resolvedTotal > 50;
  const pageSizeOptions = paginationConfig.pageSizeOptions ?? [10, 20, 50, 100];
  const pages = getPaginationItems(current, totalPages);

  const setPage = (page: number, nextPageSize = pageSize) => {
    if (disabled) return;

    const nextTotalPages = Math.max(1, Math.ceil(resolvedTotal / nextPageSize));
    const nextPage = Math.min(Math.max(page, 1), nextTotalPages);

    table.setPagination({ pageIndex: nextPage - 1, pageSize: nextPageSize });
    paginationConfig.onChange?.(nextPage, nextPageSize);
  };

  const handleJumpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextPage = Number(event.target.value);

    if (Number.isInteger(nextPage)) {
      setPage(nextPage);
    }
  };

  if (resolvedTotal === 0) return null;

  if (paginationConfig.hideOnSinglePage && totalPages <= 1) return null;

  return (
    <When condition={Boolean(config) && config !== false && paginationConfig.enable !== false}>
      <div className={cn("border-t px-3 py-2", paginationConfig.className)}>
        <Pagination>
          {paginationConfig.showTotal && (
            <span className="text-sm text-muted-foreground">
              {paginationConfig.showTotal(resolvedTotal, [startIndex, endIndex])}
            </span>
          )}
          <PaginationContent className={cn("flex-wrap gap-2", paginationConfig.contentClassName)}>
            <PaginationItem>
              <PaginationPrevious
                disabled={current <= 1 || disabled}
                onClick={() => setPage(current - 1)}
                title="上一页"
                aria-label="上一页"
              />
            </PaginationItem>

            {pages.map((page, index) => (
              <PaginationItem key={`${page}-${index}`}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    isActive={page === current}
                    disabled={disabled}
                    onClick={() => setPage(page)}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                disabled={current >= totalPages || disabled}
                onClick={() => setPage(current + 1)}
                title="下一页"
                aria-label="下一页"
              />
            </PaginationItem>

            {showSizeChanger && (
              <PaginationItem>
                <Select
                  value={String(pageSize)}
                  disabled={disabled}
                  onValueChange={(value) => setPage(current, Number(value))}
                >
                  <SelectTrigger size="sm" className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option} / 页
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </PaginationItem>
            )}

            {paginationConfig.showQuickJumper && (
              <PaginationItem>
                <Input
                  disabled={disabled}
                  min={1}
                  max={totalPages}
                  type="number"
                  className="h-8 w-16"
                  onBlur={handleJumpChange}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleJumpChange(event as unknown as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    </When>
  );
}
