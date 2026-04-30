import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
} from "@rap/components-ui/dialog";
import { useResize, type ResizeOptions, type Position, type Size } from "@rap/hooks/use-resize";
import { cn } from "@rap/utils";
import { useRef, } from "react";

export interface ResizableDialogProps {
	children: React.ReactNode;
	triggerChildren?: React.ReactNode;
	header?: React.ReactNode;
	footer?: React.ReactNode;
	dialogProps?: React.ComponentProps<typeof Dialog>;
	resizeOptions?: ResizeOptions;
	contentProps?: React.ComponentProps<typeof DialogContent>;
	headerProps?: React.ComponentProps<typeof DialogHeader>;
	footerProps?: React.ComponentProps<typeof DialogFooter>;
}

export function ResizableDialog({
	children,
	triggerChildren,
	header,
	footer,
	dialogProps,
	resizeOptions,
	contentProps,
	headerProps,
	footerProps,
}: ResizableDialogProps) {

	const {
		resizeRef,
		isResizing,
		size,
		position,
		cursor,
		bindEvent,
		removeEvent,
	} = useResize<HTMLDivElement>(resizeOptions);

	const rafIdRef = useRef(-1);

	const handleOpenChange = (open: boolean) => {
		if (open) {
			rafIdRef.current = requestAnimationFrame(() => {
				bindEvent();
			});
		} else {
			removeEvent();
			cancelAnimationFrame(rafIdRef.current);
		}
		dialogProps?.onOpenChange?.(open);
	};

	const getStyle = (position: Position | null, size: Size | null, cursor: string) => {
		const maxWidth = resizeOptions?.maxSize?.width ? `${resizeOptions?.maxSize?.width}px` : "none";
		const maxHeight = resizeOptions?.maxSize?.height ? `${resizeOptions?.maxSize?.height}px` : "none";
		if (size && position) {
			const style: React.CSSProperties = {};
			style.width = `${size.width}px`;
			style.height = `${size.height}px`;
			style.cursor = cursor;
			style.maxWidth = maxWidth;
			style.maxHeight = maxHeight;
			return style;
		}
		return {
			cursor,
			width: 'auto',
			maxWidth,
			maxHeight
		}
	}


	return (
		<Dialog {...dialogProps} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{triggerChildren}
			</DialogTrigger>
			<DialogContent
				{...contentProps}
				ref={resizeRef}
				className={cn(
					isResizing && "select-none",
					contentProps?.className
				)}
				style={getStyle(position, size, cursor)}
			>

				{header && (
					<DialogHeader {...headerProps}>
						{header}
					</DialogHeader>
				)}
				{children}
				{footer && (
					<DialogFooter {...footerProps}>
						{footer}
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
