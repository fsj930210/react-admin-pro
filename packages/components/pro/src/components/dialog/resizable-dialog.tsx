import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
} from "@rap/components-ui/dialog";
import { useResize, type ResizeDirection, type ResizeOptions } from "@rap/hooks/use-resize";
import { cn } from "@rap/utils";

export interface ResizableDialogProps {
	children: React.ReactNode;
	triggerChildren?: React.ReactNode;
	header?: React.ReactNode;
	footer?: React.ReactNode;
	dialogProps?: React.ComponentProps<typeof Dialog>;
	resizeOptions?: ResizeOptions<HTMLDivElement>;
	contentProps?: React.ComponentProps<typeof DialogContent>;
	headerProps?: React.ComponentProps<typeof DialogHeader>;
	footerProps?: React.ComponentProps<typeof DialogFooter>;
}

const resizeDirections: ResizeDirection[] = ["n", "s", "w", "e", "nw", "ne", "sw", "se"];

function getHandleClassName(direction: ResizeDirection) {
	const vertical = direction === "n" || direction === "s";
	const horizontal = direction === "w" || direction === "e";

	return cn(
		"absolute z-10 touch-none select-none bg-transparent",
		direction.includes("n") && "-top-2",
		direction.includes("s") && "-bottom-2",
		direction.includes("w") && "-left-2",
		direction.includes("e") && "-right-2",
		vertical && "left-6 right-6 h-4",
		horizontal && "top-6 bottom-6 w-4",
		direction.length === 2 && "h-8 w-8"
	);
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
	const { targetRef, getHandleProps, style: resizeStyle, isResizing, reset } = useResize<HTMLDivElement>({
		bounds: "viewport",
		edgeResize: false,
		minSize: { width: 320, height: 180 },
		...resizeOptions,
		freezeSizeOnStart: true,
		resizeOrigin: "center",
	});

	const handleOpenChange = (open: boolean) => {
		if (!open) reset();
		dialogProps?.onOpenChange?.(open);
	};

	return (
		<Dialog {...dialogProps} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{triggerChildren}</DialogTrigger>
			<DialogContent
				{...contentProps}
				ref={targetRef}
				className={cn(
					"max-w-none! max-h-none! duration-0! data-[state=open]:zoom-in-100! data-[state=closed]:zoom-out-100!",
					isResizing && "select-none",
					contentProps?.className
				)}
				style={{
					...contentProps?.style,
					width: resizeStyle.width ?? (contentProps?.style?.width ?? "auto"),
					height: resizeStyle.height ?? contentProps?.style?.height,
					boxSizing: "border-box",
					maxWidth: resizeOptions?.maxSize?.width
						? `${resizeOptions.maxSize.width}px`
						: (contentProps?.style?.maxWidth ?? "none"),
					maxHeight: resizeOptions?.maxSize?.height
						? `${resizeOptions.maxSize.height}px`
						: (contentProps?.style?.maxHeight ?? "none"),
					transform: resizeStyle.transform,
					willChange: isResizing ? "width, height, transform" : contentProps?.style?.willChange,
				}}
			>
				{header && <DialogHeader {...headerProps}>{header}</DialogHeader>}
				{children}
				{footer && <DialogFooter {...footerProps}>{footer}</DialogFooter>}
				{resizeDirections.map((direction) => (
					<div
						key={direction}
						{...getHandleProps(direction)}
						className={getHandleClassName(direction)}
					/>
				))}
			</DialogContent>
		</Dialog>
	);
}
