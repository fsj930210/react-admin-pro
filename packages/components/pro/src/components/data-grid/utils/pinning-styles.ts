
import type { Column, Row } from "@tanstack/react-table";
import type { CSSProperties } from "react";


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
export function getColumnPinningStyles<TData>(column: Column<TData>): PinningStyleResult {
	const pinned = column.getIsPinned();
	if (!pinned) return {};

	const isLastLeft = pinned === "left" && column.getIsLastColumn("left");
	const isFirstRight = pinned === "right" && column.getIsFirstColumn("right");
	  const className = isLastLeft
    ? 'pinned-shadow-left'
    : isFirstRight
      ? 'pinned-shadow-right'
      : undefined
	return {
		className,
		style: {
			left: pinned === "left" ? `${column.getStart("left")}px` : undefined,
			right: pinned === "right" ? `${column.getAfter("right")}px` : undefined,
			position: pinned ? "sticky" : "relative",
			width: column.getSize(),
			zIndex: pinned ? 1 : 0,
		},
	};
}


/**
 * Row pinning uses the configured row height CSS variable instead of measuring
 * every row. That keeps fixed rows deterministic and avoids a layout read per
 * row during render. Consumers with custom row heights can override
 * `--rap-data-grid-row-height` on the grid root.
 */
export function getRowPinningStyles<TData>(row: Row<TData>, topRowsCount = 0, bottomRowsCount = 0): PinningStyleResult {
	const pinned = row.getIsPinned();
	if (!pinned) return {};
	const pinnedIndex = row.getPinnedIndex();
	const isLastTopPinnedRow = pinned === "top" && pinnedIndex === topRowsCount - 1;
	const isFirstBottomPinnedRow = pinned === "bottom" && pinnedIndex === 0;

	return {
		className: "sticky z-10 bg-background shadow-sm",
		style: {
			background: "var(--background)",
			top: pinned === "top" ? `calc(var(--rap-data-grid-header-height, 0px) + ${pinnedIndex} * var(--rap-data-grid-row-height, 40px))` : undefined,
			bottom: pinned === "bottom" ? `calc(${Math.max(bottomRowsCount - pinnedIndex - 1, 0)} * var(--rap-data-grid-row-height, 40px))` : undefined,
			boxShadow: isLastTopPinnedRow
				? "0 4px 6px -6px rgb(0 0 0 / 0.35)"
				: isFirstBottomPinnedRow
					? "0 -4px 6px -6px rgb(0 0 0 / 0.35)"
					: undefined,
		},
	};
}
