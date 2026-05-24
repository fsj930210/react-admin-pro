import { cn } from "@rap/utils";
import type { Header } from "@tanstack/react-table";
import type { MouseEvent, TouchEvent } from "react";

interface HeaderSeparatorProps<TData> {
	header: Header<TData, unknown>;
	border?: boolean;
}

export function HeaderSeparator<TData>({ header, border }: HeaderSeparatorProps<TData>) {
	const isResizing = header.column.getIsResizing();
	const canResize = header.column.getCanResize();
	const resizeHandler = header.getResizeHandler();

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
				"absolute right-0 top-0 z-20 h-full w-2 touch-none select-none",
				"after:absolute after:left-1/2 after:top-1/2 after:h-1/2 after:w-1 after:-translate-y-1/2 after:translate-x-1/2 after:bg-border after:transition-all after:content-['']",
				canResize && "cursor-ew-resize",
				border && "after:opacity-0 group-hover/th:after:opacity-100",
				isResizing && "after:bg-primary after:opacity-100",
			)}
			aria-hidden="true"
			data-resizing={isResizing ? "true" : undefined}
		/>
	);
}
