import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
} from "@rap/components-ui/dialog";
import { useMove, type MoveOptions } from "@rap/hooks/use-move";
import { cn } from "@rap/utils";

export interface MovableDialogProps {
	children: React.ReactNode;
	triggerChildren?: React.ReactNode;
	header?: React.ReactNode;
	footer?: React.ReactNode;
	dialogProps?: React.ComponentProps<typeof Dialog>;
	moveOptions?: MoveOptions<HTMLDivElement>;
	contentProps?: React.ComponentProps<typeof DialogContent>;
	headerProps?: React.ComponentProps<typeof DialogHeader>;
	footerProps?: React.ComponentProps<typeof DialogFooter>;
}

export function MovableDialog({
	children,
	triggerChildren,
	header,
	footer,
	dialogProps,
	moveOptions,
	contentProps,
	headerProps,
	footerProps,
}: MovableDialogProps) {
	const { targetRef, handleRef, transform, isMoving, reset } = useMove<HTMLDivElement, HTMLDivElement>({
		bounds: "viewport",
		boundaryMode: "keep-handle-visible",
		...moveOptions,
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
				style={{
					...contentProps?.style,
					transform,
					willChange: isMoving ? "transform" : contentProps?.style?.willChange,
				}}
			>
				<DialogHeader
					{...headerProps}
					ref={handleRef}
					className={cn("select-none cursor-move touch-none", headerProps?.className)}
				>
					{header}
				</DialogHeader>
				{children}
				{footer && <DialogFooter {...footerProps}>{footer}</DialogFooter>}
			</DialogContent>
		</Dialog>
	);
}
