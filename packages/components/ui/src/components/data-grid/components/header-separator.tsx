import { cn } from "@rap/utils";
import type { Header } from "@tanstack/react-table";
import { type MouseEvent, type TouchEvent } from "react";

interface HeaderSeparatorProps<TData> {
  header: Header<TData, unknown>;
  border?: boolean;
}

export function HeaderSeparator<TData>({ header, border }: HeaderSeparatorProps<TData>) {
  const isResizing = header.column.getIsResizing();
  const canResize = header.subHeaders.length === 0 && header.column.getCanResize();
  const resizeHandler = header.getResizeHandler();

  if (border && !canResize) {
    return null;
  }

  const handleResizeMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    resizeHandler(event);
  };

  const handleResizeTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    resizeHandler(event);
  };

  return (
    <div
      onMouseDown={canResize ? handleResizeMouseDown : undefined}
      onTouchStart={canResize ? handleResizeTouchStart : undefined}
      className={cn(
        "absolute -right-1 top-0 z-20 h-full w-2 touch-none select-none",
        "after:absolute after:left-1/2 after:top-1/2 after:h-1/2 after:w-px after:-translate-x-1/2 after:-translate-y-1/2 after:bg-[var(--rap-data-grid-border-color)] after:transition-all after:content-['']",
        canResize && "cursor-ew-resize",
        !canResize && "pointer-events-none",
        isResizing && "after:bg-primary after:opacity-100"
      )}
      aria-hidden="true"
      data-resizing={isResizing ? "true" : undefined}
    />
  );
}
