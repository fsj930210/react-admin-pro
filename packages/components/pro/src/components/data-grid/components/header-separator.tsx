import { cn } from "@rap/utils";
import type { Header } from "@tanstack/react-table";

interface HeaderSeparatorProps<TData> {
	header: Header<TData, unknown>;
	border?: boolean;
}
export function HeaderSeparator<TData>({ header, border }: HeaderSeparatorProps<TData>) {
	const isResizing = header.column.getIsResizing();
	const canResize = header.column.getCanResize();

	return (
		<div
			onMouseDown={canResize ? header.getResizeHandler() : undefined}
			onTouchStart={canResize ? header.getResizeHandler() : undefined}
			className={cn(
				"absolute right-0 top-0 h-full z-2 w-2",
				"after:absolute after:h-1/2 after:w-0.5 after:top-1/2 after:-translate-y-1/2 after:left-1/2 after:translate-x-1/2 after:bg-border transition-all",
				canResize && "cursor-ew-resize",
				border && "after:opacity-0 group-hover/th:after:opacity-100",
				isResizing && "after:bg-primary"
			)}
			aria-hidden="true"
			data-resizing={isResizing ? "true" : undefined}
		/>
	)
}
