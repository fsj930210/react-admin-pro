import { Button } from "@rap/components-base/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@rap/components-base/card";
import { DialogTitle } from "@rap/components-base/dialog";

import { ResizableDialog } from "@rap/components-ui/dialog";
import { useResize } from "@rap/hooks/use-resize";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(layouts)/features/resize/")({
	component: ResizeFeaturePage,
});

// 可从8个方向调整大小的基本块组件
function ResizableBlock() {
	const [resizable, setResizable] = useState(true);
	const [enableEdgeResize, setEnableEdgeResize] = useState(true);
	const { resizeRef, size, position, cursor } = useResize<HTMLDivElement>({
		minSize: { width: 150, height: 150 },
		maxSize: { width: 400, height: 400 },
		directions: ["n", "s", "w", "e", "nw", "ne", "sw", "se"],
		disabled: !resizable,
		enableEdgeResize: enableEdgeResize,
		edgeSize: 8,
		onResize: (newSize, newPosition) => {
			console.log("Block resized:", newSize, newPosition);
		},
	});

	return (
		<div
			ref={resizeRef}
			style={
				size && position
					? {
							width: `${size.width}px`,
							height: `${size.height}px`,
							transform: `translate(${position.x}px, ${position.y}px)`,
							willChange: "transform",
						}
					: { width: "250px", height: "250px", cursor: cursor }
			}
			className="bg-background border-2 border-border rounded-lg shadow-md"
		>
			<div className="p-4">
				<h3 className="font-medium mb-2">可调整大小的块</h3>
				<p className="mb-2 text-sm">
					当前尺寸: {size ? `${Math.round(size.width)} × ${Math.round(size.height)}` : "250 × 250"}
				</p>
				<p className="mb-2 text-sm">
					{enableEdgeResize ? "拖拽边框和角落来调整大小" : "边缘调整已禁用"}
				</p>
				<div className="flex gap-2">
					<Button onClick={() => setResizable((prev) => !prev)} variant="outline" size="sm">
						{resizable ? "禁用" : "启用"}调整大小
					</Button>
					<Button onClick={() => setEnableEdgeResize((prev) => !prev)} variant="outline" size="sm">
						{enableEdgeResize ? "禁用" : "启用"}边和角resize
					</Button>
				</div>
			</div>
		</div>
	);
}

// 可调整大小的Card组件
function ResizableCard() {
	const [resizable, setResizable] = useState(true);
	const [enableEdgeResize, setEnableEdgeResize] = useState(true);
	const { resizeRef, size, position, cursor } = useResize<HTMLDivElement>({
		minSize: { width: 200, height: 150 },
		maxSize: { width: 600, height: 600 },
		directions: ["n", "s", "w", "e", "nw", "ne", "sw", "se"],
		disabled: !resizable,
		enableEdgeResize: enableEdgeResize,
		edgeSize: 8,
		onResize: (newSize, newPosition) => {
			console.log("Card resized:", newSize, newPosition);
		},
	});

	return (
		<Card
			ref={resizeRef}
			style={
				size && position
					? {
							width: `${size.width}px`,
							height: `${size.height}px`,
							transform: `translate(${position.x}px, ${position.y}px)`,
							willChange: "transform",
						}
					: { width: "300px", cursor: cursor }
			}
		>
			<CardHeader className="select-none">
				<CardTitle>可调整大小的卡片</CardTitle>
				<CardDescription>
					{enableEdgeResize ? "拖拽边框和角落来调整卡片大小" : "边缘调整已禁用"}
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-4">
				<p className="mb-2">这是一个可以调整大小的卡片组件。</p>
				<p className="mb-2 text-sm">
					当前尺寸: {size ? `${Math.round(size.width)} × ${Math.round(size.height)}` : "300 × 150"}
				</p>
				<div className="flex gap-2">
					<Button onClick={() => setResizable((prev) => !prev)} variant="outline" size="sm">
						{resizable ? "禁用" : "启用"}调整大小
					</Button>
					<Button onClick={() => setEnableEdgeResize((prev) => !prev)} variant="outline" size="sm">
						{enableEdgeResize ? "禁用" : "启用"}边和角resize
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
function ResizeFeaturePage() {
	return (
		<div className="p-6 relative min-h-[800px]">
			<h1 className="text-2xl font-bold mb-6">调整大小功能演示</h1>

			<div className="mb-8">
				<h2 className="text-xl font-semibold mb-4">1. 可从8个方向调整大小的块</h2>
				<ResizableBlock />
			</div>

			<div className="mb-8">
				<h2 className="text-xl font-semibold mb-4">2. 可调整大小的Card</h2>
				<ResizableCard />
			</div>

			<div className="mb-8">
				<h2 className="text-xl font-semibold mb-4">3. 可调整大小的Dialog</h2>
				<ResizableDialog
					header={<DialogTitle>可调整大小的Dialog</DialogTitle>}
					triggerChildren={<Button>打开Dialog</Button>}
					resizeOptions={{
						// minSize: { width: 200, height: 150 },
						maxSize: { width: 1000, height: 1000 },
						directions: ["n", "s", "w", "e", "nw", "ne", "sw", "se"],
						enableEdgeResize: true,
						edgeSize: 8,
						onResize: (newSize, newPosition) => {
							console.log("Dialog resized:", newSize, newPosition);
						},
					}}
				>
					<p>这是一个可调整大小的Dialog组件。</p>
				</ResizableDialog>
			</div>
		</div>
	);
}
