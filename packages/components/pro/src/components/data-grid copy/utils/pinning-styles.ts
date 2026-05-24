import type { CSSProperties } from "react";
import type { Column, Row } from "@tanstack/react-table";

const ROW_HEIGHT = 40;
const PINNING_SHADOW_COLOR = "color-mix(in oklch, var(--foreground) 35%, transparent)";
const PINNING_EDGE_BASE_CLASS =
	"after:pointer-events-none after:absolute after:top-0 after:bottom-0 after:w-4 after:content-['']";

export function getColumnPinningStyles<TData>(
	column: Column<TData>,
): CSSProperties {
	const isPinned = column.getIsPinned();

	return {
		left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
		opacity: isPinned ? 0.95 : 1,
		right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
		position: isPinned ? "sticky" : "relative",
		width: column.getSize(),
		zIndex: isPinned ? 2 : 0,
	};
}

export function getColumnPinningClassName<TData>(
	column: Column<TData>,
) {
	const isPinned = column.getIsPinned();

	if (isPinned === "left" && column.getIsLastColumn("left")) {
		return `${PINNING_EDGE_BASE_CLASS} after:right-0 after:bg-gradient-to-l after:from-transparent after:to-black/10 dark:after:to-white/10`;
	}

	if (isPinned === "right" && column.getIsFirstColumn("right")) {
		return `${PINNING_EDGE_BASE_CLASS} after:left-0 after:bg-gradient-to-r after:from-transparent after:to-black/10 dark:after:to-white/10`;
	}

	return undefined;
}

export function getRowPinningStyles<TData>(
	row: Row<TData>,
	topRowsCount: number,
	bottomRowsCount: number,
	pinningPosition?: "top" | "bottom",
	pinningIndex?: number,
): CSSProperties {
	const isPinned = pinningPosition ?? row.getIsPinned();
	const pinnedIndex = pinningIndex ?? row.getPinnedIndex();

	if (!isPinned) {
		return {};
	}

	const isLastTopPinnedRow =
		isPinned === "top" && pinnedIndex === topRowsCount - 1;
	const isFirstBottomPinnedRow =
		isPinned === "bottom" && pinnedIndex === 0;

	return {
		background: "var(--background)",
		bottom:
			isPinned === "bottom"
				? `${Math.max(bottomRowsCount - pinnedIndex - 1, 0) * ROW_HEIGHT}px`
				: undefined,
		boxShadow: isLastTopPinnedRow
			? `0 4px 6px -6px ${PINNING_SHADOW_COLOR}`
			: isFirstBottomPinnedRow
				? `0 -4px 6px -6px ${PINNING_SHADOW_COLOR}`
				: undefined,
		top:
			isPinned === "top"
				? `calc(var(--rap-data-grid-header-height, 0px) + ${pinnedIndex * ROW_HEIGHT}px)`
				: undefined,
	};
}
