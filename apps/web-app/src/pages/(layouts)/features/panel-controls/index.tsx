import { Button } from "@rap/components-base/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@rap/components-base/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@rap/components-base/dialog";
import { useMove } from "@rap/hooks/use-move";
import { PanelState, usePanelControls } from "@rap/hooks/use-panel-controls";
import { useResize } from "@rap/hooks/use-resize";
import { cn } from "@rap/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Maximize2, Minus, Square, X } from "lucide-react";
import { useRef, useState } from "react";

export const Route = createFileRoute("/(layouts)/features/panel-controls/")({
	component: PanelControlsFeaturePage,
});

function WindowsStyleCard() {
	const [cardStyle, setCardStyle] = useState<React.CSSProperties>({});
	const { position, isMoving, moveRef } = useMove<HTMLDivElement>({});
	const {
		resizeRef,
		size,
		position: resizePosition,
		cursor,
	} = useResize<HTMLDivElement>({
		minSize: { width: 400, height: 400 },
		maxSize: { width: 1000, height: 1000 },
		positionMode: "topLeft",
		enableEdgeResize: true,
		edgeSize: 8,
		onResize: (newSize, newPosition) => {
			console.log("Card resized:", newSize, newPosition);
		},
	});
	const { isMinimized, isMaximized, handleClose, handleMaximize, handleMinimize, handleRestore } =
		usePanelControls({
			onStateChange: (state) => {
				console.log("Card panel state changed to:", state);
				let style: React.CSSProperties = {};
				if (state === PanelState.MINIMIZED) {
					style = {
						display: "none",
					};
				} else if (state === PanelState.MAXIMIZED) {
					style = {
						width: window.innerWidth,
						height: window.innerHeight,
						position: "fixed",
						top: 0,
						left: 0,
						zIndex: 100,
						maxWidth: "none",
					};
				} else if (state === PanelState.NORMAL) {
					style = {};
				}
				setCardStyle(style);
			},
			onClose: () => {
				setCardStyle({ display: "none" });
			},
		});

	const style = { ...cardStyle };
	if (position) {
		style.transform = `translate(${position.x}px, ${position.y}px)`;
		style.willChange = "transfrom";
	}
	if (size && resizePosition) {
		style.width = size.width;
		style.height = size.height;
		style.cursor = cursor;
		style.top = resizePosition.y;
		style.left = resizePosition.x;
	}

	if (isMaximized) {
		style.width = window.innerWidth;
		style.height = window.innerHeight;
	}

	return (
		<>
			<Card
				ref={resizeRef}
				className="fixed top-0 left-0 z-100 transition-all duration-300 p-0 border-none"
				style={style}
			>
				<CardHeader
					ref={moveRef}
					className={cn(
						"border-b border-gray-200 bg-gray-50 dark:bg-gray-800 p-0",
						`select-none ${isMoving ? "cursor-move" : "cursor-default"}`,
					)}
				>
					<div className="flex justify-between">
						<div className="flex-1 px-6 py-4">
							<CardTitle className="text-gray-900 dark:text-gray-100">Windows Style Card</CardTitle>
							<CardDescription className="text-gray-600 dark:text-gray-400">
								Windows folder-style panel controls with right-top button positioning
							</CardDescription>
						</div>
						<div className="flex gap-1 shrink-0 p-1">
							<button
								className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center justify-center transition-colors"
								onClick={handleMinimize}
								disabled={isMinimized}
								title="Minimize"
							>
								<Minus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
							</button>
							<button
								className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center justify-center transition-colors"
								onClick={isMaximized ? handleRestore : handleMaximize}
								title={isMaximized ? "Restore" : "Maximize"}
							>
								{isMaximized ? (
									<Square className="w-3 h-3 text-gray-600 dark:text-gray-400" />
								) : (
									<Maximize2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
								)}
							</button>
							<button
								className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center transition-colors"
								onClick={handleClose}
								title="Close"
							>
								<X className="w-3 h-3 text-white" />
							</button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="p-4 bg-muted rounded-lg">
							<h3 className="font-semibold mb-2">Current Panel State:</h3>
							<div className="space-y-1 text-sm">
								<p>
									<strong>State:</strong>{" "}
									{isMaximized
										? PanelState.MAXIMIZED
										: isMinimized
											? PanelState.MINIMIZED
											: PanelState.NORMAL}
								</p>
								<p>
									<strong>Is Minimized:</strong> {isMinimized ? "Yes" : "No"}
								</p>
								<p>
									<strong>Is Maximized:</strong> {isMaximized ? "Yes" : "No"}
								</p>
								<p>
									<strong>Window Size:</strong> {window.innerWidth} × {window.innerHeight}
								</p>
							</div>
						</div>
						<div className="p-4 border rounded-lg">
							<p>This card uses Windows-style panel controls:</p>
							<ul className="mt-2 text-sm space-y-1">
								<li>
									• <strong>Controls:</strong> Right-top corner (minimize, maximize/restore, close)
								</li>
								<li>
									• <strong>Minimize:</strong> Windows-style taskbar preview
								</li>
								<li>
									• <strong>Maximize:</strong> Full window with fixed positioning
								</li>
								<li>
									• <strong>Close:</strong> Red close button
								</li>
							</ul>
						</div>
					</div>
				</CardContent>
				<CardFooter className="border-t border-gray-200 bg-gray-50 dark:bg-gray-800">
					<div className="text-sm text-muted-foreground">Windows-style card footer</div>
				</CardFooter>
			</Card>

			{isMinimized && (
				<div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
					<div
						className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-sm shadow-lg border border-gray-300 dark:border-gray-600 flex items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
						onClick={handleRestore}
					>
						<div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
						<span className="text-xs font-medium text-gray-700 dark:text-gray-300">Card</span>
						<div className="flex gap-1 ml-2">
							<button
								className="w-4 h-4 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded-sm flex items-center justify-center transition-colors"
								onClick={handleRestore}
								title="Restore"
							>
								<Square className="w-3 h-3 text-gray-700 dark:text-gray-300" />
							</button>
							<button
								className="w-4 h-4 bg-red-500 hover:bg-red-600 rounded-sm flex items-center justify-center transition-colors"
								onClick={handleClose}
								title="Close"
							>
								<X className="w-3 h-3 text-white" />
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

function MacOSStyleDialog() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const resizeRafIdRef = useRef<number | null>(null);
	const moveRafIdRef = useRef<number | null>(null);
	const {
		resizeRef,
		size,
		position: resizePosition,
		cursor,
		bindEvent: bindResizeEvent,
		removeEvent: removeResizeEvent,
	} = useResize<HTMLDivElement>({
		minSize: { width: 200, height: 200 },
		maxSize: { width: 1000, height: 1000 },
		positionMode: "topLeft",
		enableEdgeResize: true,
		edgeSize: 8,
		onResize: (newSize, newPosition) => {
			console.log("Dialog resized:", newSize, newPosition);
		},
	});

	const {
		position: movePosition,
		isMoving,
		moveRef,
		bindEvent: bindMoveEvent,
		removeEvent: removeMoveEvent,
	} = useMove<HTMLDivElement>({});

	// 阻止点击外部关闭Dialog
	const handleInteractOutside = (e: any) => {
		e.preventDefault();
	};

	const { isFullscreen, isMinimized, handleClose, handleMinimize, handleMaximize, handleRestore } =
		usePanelControls({
			useRequestFullScreen: true,
			onStateChange: (state) => {
				console.log("Dialog panel state changed to:", state);
			},
			onClose: () => {
				setIsDialogOpen(false);
			},
		});

	const handleOpenChange = (open: boolean) => {
		setIsDialogOpen(open);
		if (open) {
			resizeRafIdRef.current = requestAnimationFrame(() => {
				bindResizeEvent();
			});
			moveRafIdRef.current = requestAnimationFrame(() => {
				bindMoveEvent();
			});
		} else {
			removeResizeEvent();
			removeMoveEvent();
			if (resizeRafIdRef.current) {
				cancelAnimationFrame(resizeRafIdRef.current);
			}
			if (moveRafIdRef.current) {
				cancelAnimationFrame(moveRafIdRef.current);
			}
		}
	};
	const style: React.CSSProperties = {
		cursor: cursor,
		maxWidth: "none",
		width: "auto",
	};

	if (size && resizePosition) {
		style.width = `${size.width}px`;
		style.height = `${size.height}px`;
		style.top = resizePosition.y;
		style.left = resizePosition.x;
	}
	if (movePosition) {
		style.transform = `translate(${movePosition.x}px, ${movePosition.y}px)`;
		style.willChange = "transfrom";
	}
	return (
		<>
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<CardTitle>macOS Style Dialog</CardTitle>
					<CardDescription>
						macOS folder-style panel controls with left-top button positioning
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Dialog open={isDialogOpen && !isMinimized} onOpenChange={handleOpenChange}>
						<DialogTrigger asChild>
							<Button>Open macOS Style Dialog</Button>
						</DialogTrigger>
						<DialogContent
							ref={resizeRef}
							className={`transition-all duration-300 p-0 ${isFullscreen ? "w-screen! h-screen! max-w-none! rounded-none!" : ""}`}
							showCloseButton={false}
							onInteractOutside={handleInteractOutside}
							style={style}
						>
							<DialogHeader
								ref={moveRef}
								className={cn(
									"border-b border-gray-200 bg-gray-50 dark:bg-gray-800 p-0",
									`select-none ${isMoving ? "cursor-move" : "cursor-move"}`,
								)}
							>
								<div className="flex justify-between">
									<div className="flex gap-2 p-2">
										<button
											className="w-3 h-3 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
											onClick={handleClose}
											title="Close"
										>
											<X className="w-2 h-2 text-white" />
										</button>
										<button
											className="w-3 h-3 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center transition-colors"
											onClick={handleMinimize}
											disabled={isMinimized}
											title="Minimize"
										>
											<Minus className="w-2 h-2 text-white" />
										</button>
										<button
											className="w-3 h-3 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
											onClick={isFullscreen ? handleRestore : handleMaximize}
											title={isFullscreen ? "Restore" : "Maximize"}
										>
											{isFullscreen ? (
												<Square className="w-2 h-2 text-white" />
											) : (
												<Maximize2 className="w-2 h-2 text-white" />
											)}
										</button>
									</div>
									<div className="p-4">
										<DialogTitle>macOS Style Dialog Controls</DialogTitle>
										<DialogDescription>
											macOS folder-style circular buttons (red, yellow, green)
										</DialogDescription>
									</div>
								</div>
							</DialogHeader>

							<div className="space-y-4">
								<div className="p-4 bg-muted rounded-lg">
									<h3 className="font-semibold mb-2">Dialog Panel State:</h3>
									<div className="space-y-1 text-sm">
										<p>
											<strong>State:</strong>{" "}
											{isFullscreen
												? PanelState.FULLSCREEN
												: isFullscreen
													? PanelState.FULLSCREEN
													: isMinimized
														? PanelState.MINIMIZED
														: PanelState.NORMAL}
										</p>
										<p>
											<strong>Is Minimized:</strong> {isMinimized ? "Yes" : "No"}
										</p>
										<p>
											<strong>Is Dialog Fullscreen:</strong> {isFullscreen ? "Yes" : "No"}
										</p>
									</div>
								</div>
								<div className="p-4 border rounded-lg">
									<p>This dialog uses macOS-style panel controls:</p>
									<ul className="mt-2 text-sm space-y-1">
										<li>
											• <strong>Controls:</strong> Left-top corner (red=close, yellow=minimize,
											green=maximize)
										</li>
										<li>
											• <strong>Minimize:</strong> Simple circular taskbar button
										</li>
										<li>
											• <strong>Fullscreen:</strong> Dialog-specific fullscreen mode
										</li>
										<li>
											• <strong>Style:</strong> macOS-inspired design
										</li>
									</ul>
								</div>
							</div>

							<DialogFooter className="border-t border-gray-200">
								<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
									Cancel
								</Button>
								<Button onClick={() => setIsDialogOpen(false)}>Save Changes</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</CardContent>
			</Card>

			{/* Minimized Dialog Bar */}
			{isMinimized && (
				<div
					className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300 cursor-pointer"
					onClick={() => {
						handleRestore();
						setIsDialogOpen(true);
					}}
				>
					<div className="bg-gray-100 dark:bg-gray-800 w-10 h-10 rounded-full shadow-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
						<span className="text-xs font-bold text-gray-700 dark:text-gray-300">D</span>
					</div>
				</div>
			)}
		</>
	);
}

// Main Feature Page
function PanelControlsFeaturePage() {
	return (
		<div className="p-6 space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Panel Controls</h1>
				<p className="text-muted-foreground">
					Windows-style Card and macOS-style Dialog with real minimization and maximization
				</p>
			</div>

			<WindowsStyleCard />
			<MacOSStyleDialog />

			{/* Features Overview */}
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<CardTitle>Enhanced Panel Controls Features</CardTitle>
					<CardDescription>Windows and macOS style implementations</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="p-4 border rounded-lg">
							<h3 className="font-semibold mb-2">Windows Style (Card)</h3>
							<ul className="text-sm space-y-1">
								<li>• Right-top button positioning</li>
								<li>• Square minimize/maximize/close icons</li>
								<li>• Red close button</li>
								<li>• Taskbar preview bar</li>
								<li>• Fixed window maximization</li>
							</ul>
						</div>
						<div className="p-4 border rounded-lg">
							<h3 className="font-semibold mb-2">macOS Style (Dialog)</h3>
							<ul className="text-sm space-y-1">
								<li>• Left-top button positioning</li>
								<li>• Circular colored buttons</li>
								<li>• Red=close, Yellow=minimize, Green=maximize</li>
								<li>• Simple circular taskbar</li>
								<li>• Dialog-specific fullscreen</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
