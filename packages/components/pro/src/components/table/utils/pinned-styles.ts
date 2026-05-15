import type { Column } from "@tanstack/react-table"
import type { CSSProperties } from "react"

export function getPinningStyles <TData>(column: Column<TData>)  {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn =
    isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinnedColumn =
    isPinned === 'right' && column.getIsFirstColumn('right')
  const style: CSSProperties = {
    backgroundColor: isPinned ? 'var(--background)' : undefined,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? 'sticky' : 'relative',
    zIndex: isPinned ? 1 : 0,
  }

  const className = isLastLeftPinnedColumn
    ? 'pinned-shadow-left'
    : isFirstRightPinnedColumn
      ? 'pinned-shadow-right'
      : undefined

  return {
    style,
    className,
  }
}