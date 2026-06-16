import type { Column, Header, Row } from "@tanstack/react-table";
import { type CSSProperties } from "react";

export interface PinningStyleResult {
  className?: string;
  style?: CSSProperties;
}

/**
 * Sticky columns need two pieces of information from TanStack: the side
 * (`left`/`right`) and the already accumulated offset for that side. The shadow
 * is only applied to the boundary column, which prevents every pinned cell from
 * drawing its own divider and keeps large pinned groups visually quiet.
 */
export function getColumnPinningStyles<TData>(
  column: Column<TData>,
  visibleColumns?: Column<TData>[]
): PinningStyleResult {
  const groupPinning = getGroupPinningState(column, visibleColumns);
  const pinned = groupPinning?.pinned ?? column.getIsPinned();
  if (!pinned) {
    return {
      style: {
        position: "relative",
        zIndex: 1,
      },
    };
  }

  return {
    className: "pinned-cell bg-background [background-color:var(--background)]",
    style: {
      left:
        pinned === "left"
          ? `${groupPinning?.offset ?? getPinnedOffset(column, "left", visibleColumns)}px`
          : undefined,
      right:
        pinned === "right"
          ? `${groupPinning?.offset ?? getPinnedOffset(column, "right", visibleColumns)}px`
          : undefined,
      position: "sticky",
      width: groupPinning?.width,
      zIndex: pinned === "left" ? 20 : 19,
    },
  };
}

export function getHeaderPinningStyles<TData>(
  header: Header<TData, unknown>,
  visibleColumns?: Column<TData>[]
): PinningStyleResult {
  const headerPinning = getHeaderPinningState(header, visibleColumns);
  if (headerPinning) {
    return {
      className: "pinned-cell bg-muted [background-color:var(--muted)]",
      style: {
        left: headerPinning.pinned === "left" ? `${headerPinning.offset}px` : undefined,
        position: "sticky",
        right: headerPinning.pinned === "right" ? `${headerPinning.offset}px` : undefined,
        width: headerPinning.width,
        zIndex: headerPinning.pinned === "left" ? 30 : 29,
      },
    };
  }

  return getColumnPinningStyles(header.column, visibleColumns);
}

function getGroupPinningState<TData>(column: Column<TData>, visibleColumns?: Column<TData>[]) {
  if (!column.columns.length) {
    return undefined;
  }

  const leafColumns = column.getLeafColumns().filter((leafColumn) => leafColumn.getIsVisible());
  if (!leafColumns.length) {
    return undefined;
  }

  const pinned = leafColumns[0]?.getIsPinned();
  if (!pinned || leafColumns.some((leafColumn) => leafColumn.getIsPinned() !== pinned)) {
    return undefined;
  }

  return {
    offset: getPinnedGroupOffset(leafColumns, pinned, visibleColumns),
    pinned,
    width: leafColumns.reduce((total, leafColumn) => total + leafColumn.getSize(), 0),
  };
}

function getHeaderPinningState<TData>(
  header: Header<TData, unknown>,
  visibleColumns?: Column<TData>[]
) {
  const leafColumns = header.column.getLeafColumns().filter((column) => column.getIsVisible());

  if (!leafColumns.length) {
    return undefined;
  }

  const pinned = leafColumns[0]?.getIsPinned();
  if (!pinned || leafColumns.some((column) => column.getIsPinned() !== pinned)) {
    return undefined;
  }

  return {
    offset: getPinnedGroupOffset(leafColumns, pinned, visibleColumns),
    pinned,
    width: leafColumns.reduce((total, column) => total + column.getSize(), 0),
  };
}

function getPinnedGroupOffset<TData>(
  leafColumns: Column<TData>[],
  pinned: "left" | "right",
  visibleColumns?: Column<TData>[]
) {
  const offsets = leafColumns.map((column) => getPinnedOffset(column, pinned, visibleColumns));
  return Math.min(...offsets);
}

function getPinnedOffset<TData>(
  column: Column<TData>,
  pinned: "left" | "right",
  visibleColumns?: Column<TData>[]
) {
  if (!visibleColumns?.length) {
    return pinned === "left" ? column.getStart("left") : column.getAfter("right");
  }

  const visiblePinnedColumns = visibleColumns.filter((item) => item.getIsPinned() === pinned);
  const index = visiblePinnedColumns.findIndex((item) => item.id === column.id);
  if (index === -1) {
    return pinned === "left" ? column.getStart("left") : column.getAfter("right");
  }

  const offsetColumns =
    pinned === "left"
      ? visiblePinnedColumns.slice(0, index)
      : visiblePinnedColumns.slice(index + 1);

  return offsetColumns.reduce((total, item) => total + item.getSize(), 0);
}

/**
 * Row pinning uses the configured row height CSS variable instead of measuring
 * every row. That keeps fixed rows deterministic and avoids a layout read per
 * row during render. Consumers with custom row heights can override
 * `--rap-data-grid-row-height` on the grid root.
 */
export function getRowPinningStyles<TData>(
  row: Row<TData>,
  topRowsCount = 0,
  bottomRowsCount = 0
): PinningStyleResult {
  const pinned = row.getIsPinned();
  if (!pinned) return {};
  const pinnedIndex = row.getPinnedIndex();
  const isLastTopPinnedRow = pinned === "top" && pinnedIndex === topRowsCount - 1;
  const isFirstBottomPinnedRow = pinned === "bottom" && pinnedIndex === 0;

  return {
    className: "sticky z-10 bg-background shadow-sm",
    style: {
      background: "var(--background)",
      top:
        pinned === "top"
          ? `calc(var(--rap-data-grid-header-height, 0px) + ${pinnedIndex} * var(--rap-data-grid-row-height, 40px))`
          : undefined,
      bottom:
        pinned === "bottom"
          ? `calc(${Math.max(bottomRowsCount - pinnedIndex - 1, 0)} * var(--rap-data-grid-row-height, 40px))`
          : undefined,
      boxShadow: isLastTopPinnedRow
        ? "0 4px 6px -6px rgb(0 0 0 / 0.35)"
        : isFirstBottomPinnedRow
          ? "0 -4px 6px -6px rgb(0 0 0 / 0.35)"
          : undefined,
    },
  };
}
