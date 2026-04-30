import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
} from "@rap/components-ui/dialog";
import { useMinimax, type MinimaxOptions, MinimaxState } from "@rap/hooks/use-minimax";
import { useMove, type MoveOptions } from "@rap/hooks/use-move";
import { cn } from "@rap/utils";
import ReactDOM from "react-dom";
import { useState } from "react";
import { Button } from "@rap/components-ui/button";
import { Minus, Maximize2, X, Minimize2 } from "lucide-react";

export interface MinimaxDialogProps {
	children: React.ReactNode;
	triggerChildren?: React.ReactNode;
	header?: React.ReactNode;
	footer?: React.ReactNode;
	dialogProps?: React.ComponentProps<typeof Dialog>;
	minimaxOptions?: MinimaxOptions;
	contentProps?: React.ComponentProps<typeof DialogContent>;
	headerProps?: React.ComponentProps<typeof DialogHeader>;
	footerProps?: React.ComponentProps<typeof DialogFooter>;
	actions?: {
		close?: boolean;
		minimize?: boolean;
		maximize?: boolean;
		render?: {
			close?: React.ReactNode;
			minimize?: React.ReactNode;
			maximize?: React.ReactNode;
			restore?: React.ReactNode;
		};
	};
	minimizedBar?: {
		draggable?: boolean;
		render?: React.ReactNode;
		className?: string;
		style?: React.CSSProperties;
		moveOptions?: MoveOptions<HTMLDivElement>;
		initialPosition?: { right: number; bottom: number };
	};
}

const DefaultMinimizeBar = ({ onClick }: { onClick?: (event: React.MouseEvent) => void }) => (
	<div
		onClick={onClick}
		className="w-12 h-12 rounded-full bg-primary cursor-pointer hover:scale-110 transition-transform"
	/>
);

function MinimizedBar({
	draggable,
	render,
	className,
	style,
	moveOptions,
	onClick,
	initialPosition,
}: {
	draggable: boolean;
	render?: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
	moveOptions?: MoveOptions<HTMLDivElement>;
	initialPosition?: { right: number; bottom: number };
	onClick?: (event: React.MouseEvent) => void;
}) {


	const {
		position,
		moveRef,
		isDragged,
	} = useMove<HTMLDivElement>({
		...moveOptions,
		disabled: !draggable,
		boundary: true,
	});

	const handleClick = (e: React.MouseEvent) => {
		if (isDragged) return;
		onClick?.(e);
	};

	const barContent = render || <DefaultMinimizeBar onClick={handleClick} />;

	return (
		<div
			ref={moveRef}
			className={cn(
				draggable && "cursor-move",
				"fixed z-999",
				className
			)}
			style={{
				right: initialPosition?.right ?? 40,
				bottom: initialPosition?.bottom ?? 40,
				...style,
				...position
					? {
						transform: `translate(${position.x}px, ${position.y}px)`,
						willChange: "transform",
					}

					: undefined,
			}}
		>
			{barContent}
		</div>
	);
}

export function MinimaxDialog({
	children,
	triggerChildren,
	header,
	footer,
	dialogProps,
	minimaxOptions,
	contentProps,
	headerProps,
	footerProps,
	actions,
	minimizedBar,
}: MinimaxDialogProps) {
	const [open, setOpen] = useState(false);
	const [previousState, setPreviousState] = useState<MinimaxState>(MinimaxState.NORMAL);

	const {
		close = true,
		minimize = true,
		maximize = true,
		render: actionRender = {},
	} = actions || {};

	const {
		close: closeIcon,
		minimize: minimizeIcon,
		maximize: maximizeIcon,
	} = actionRender;

	const {
		draggable: minimizeBarDraggable = true,
		render: minimizeBarRender,
		className: minimizeBarClassName = "",
		style: minimizeBarStyle,
		moveOptions: minimizeBarMoveOptions,
		initialPosition: minimizeBarInitialPosition,
	} = minimizedBar || {};

	const {
		isMinimized,
		isMaximized,
		handleMinimize,
		handleMaximize,
		handleRestore,
		handleClose,
	} = useMinimax({
		...minimaxOptions,
		onStateChange: (state) => {
			if (state === MinimaxState.MINIMIZED) {
				setPreviousState((prev) => (prev === MinimaxState.MINIMIZED ? MinimaxState.NORMAL : prev));
			}
			minimaxOptions?.onStateChange?.(state);
		},
	});

	const handleMinimizeClick = () => {
		setPreviousState(isMaximized ? MinimaxState.MAXIMIZED : MinimaxState.NORMAL);
		handleMinimize();
	};

	const handleMaximizeClick = () => {
		if (isMaximized) {
			handleRestore();
		} else {
			setPreviousState(isMinimized ? MinimaxState.NORMAL : MinimaxState.MINIMIZED);
			handleMaximize();
		}
	};

	const handleCloseClick = () => {
		setOpen(false);
		handleClose();
	};

	const handleMinimizeBarClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (previousState === MinimaxState.MAXIMIZED) {
			handleMaximize();
		} else {
			handleRestore();
		}
	};

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		dialogProps?.onOpenChange?.(isOpen);
	};

	const hasActions = close || minimize || maximize;

	const renderActions = () => {
		if (!hasActions) return null;

		return (
			<div className="absolute top-2 right-2 flex items-center gap-1">
				{minimize && (
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={handleMinimizeClick}
					>
						{minimizeIcon || <Minus />}
					</Button>
				)}
				{maximize && (
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={handleMaximizeClick}
					>
						{maximizeIcon || (isMaximized ? <Minimize2 /> : <Maximize2 />)}
					</Button>
				)}
				{close && (
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={handleCloseClick}
					>
						{closeIcon || <X />}
					</Button>
				)}
			</div>
		);
	};

	const renderContent = () => {
		if (isMinimized) {
			return null;
		}

		return (
			<DialogContent
				{...contentProps}
				className={cn(
					isMaximized && "max-w-screen! max-h-screen h-screen w-screen rounded-none",
					contentProps?.className
				)}
			>
				<DialogHeader {...headerProps}>
					{header}
				</DialogHeader>
				{children}
				{footer && (
					<DialogFooter {...footerProps}>{footer}</DialogFooter>
				)}
				{renderActions()}
			</DialogContent>
		);
	};

	return (
		<>
			<Dialog {...dialogProps} open={open} onOpenChange={handleOpenChange}>
				<DialogTrigger asChild>{triggerChildren}</DialogTrigger>
				{renderContent()}
			</Dialog>
			{isMinimized && ReactDOM.createPortal(
				<MinimizedBar
					draggable={minimizeBarDraggable}
					render={minimizeBarRender}
					className={minimizeBarClassName}
					style={minimizeBarStyle}
					moveOptions={minimizeBarMoveOptions}
					initialPosition={minimizeBarInitialPosition}
					onClick={handleMinimizeBarClick}
				/>,
				document.body
			)}
		</>
	);
}
