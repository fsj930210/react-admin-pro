import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
} from "@rap/components-base/dialog";
import { useMove, type MoveOptions } from "@rap/hooks/use-move";
import { cn } from "@rap/utils";
import { useRef } from "react";

export interface MovableDialogProps {
	children: React.ReactNode;
	triggerChildren?: React.ReactNode;
	header?: React.ReactNode;
	footer?: React.ReactNode;
	dialogProps?: React.ComponentProps<typeof Dialog>;
	moveOptions?: Omit<MoveOptions<HTMLDivElement>, "styleRef">;
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
	const dialogContentRef = useRef<HTMLDivElement | null>(null);
	
	const {
		position,
		moveRef,
		bindEvent,
		removeEvent,
	} = useMove<HTMLDivElement>({
		...moveOptions,
	});
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
	return (
		<Dialog {...dialogProps} onOpenChange={handleOpenChange} >
			<DialogTrigger asChild>
				{triggerChildren}
			</DialogTrigger>
			<DialogContent
				{...contentProps}
				ref={dialogContentRef}
				style={
					position
						? {
								transform: `translate(${position.x}px, ${position.y}px)`,
								willChange: "transfrom",
							}
						: undefined
				}
			>
				<DialogHeader
					{...headerProps}
					ref={moveRef}
					className={cn(
						"select-none cursor-move",
						headerProps?.className,
					)}
				>
					{header}
				</DialogHeader>
				{children}
				{
					footer && (
						<DialogFooter {...footerProps}>
							{footer}
						</DialogFooter>
					)
				}
			</DialogContent>
		</Dialog>
	)
}