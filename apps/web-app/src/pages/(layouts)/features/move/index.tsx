/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
import { Button } from "@rap/components-base/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@rap/components-base/card";
import { DialogDescription, DialogTitle } from "@rap/components-base/dialog";
import { MovableDialog } from "@rap/components-ui/dialog";
import { useMove } from "@rap/hooks/use-move";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
export const Route = createFileRoute("/(layouts)/features/move/")({
	component: MoveFeaturePage,
});

// 容器模式示例
function ContainerExample() {
	const containerRef = useRef<HTMLDivElement>(null);
	const { moveRef, position } = useMove<HTMLDivElement>({
		containerRef,
		boundary: true,
		snapThreshold: 30,
		snapToBoundary: true,
	});

	return (
		<div className="mb-8">
			<h3 className="text-lg font-semibold mb-3">容器模式，带边界，吸附</h3>
			<div
				ref={containerRef}
				className="relative w-75 h-75 border-2 border-blue-500 overflow-hidden bg-blue-50 rounded-lg"
			>
				<div
					ref={moveRef}
					style={
						position
							? {
									transform: `translate(${position.x}px, ${position.y}px)`,
									willChange: "transform",
								}
							: undefined
					}
					className="absolute top-10 left-15 w-32 h-32 bg-blue-600 text-white rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
				>
					<div className="font-semibold mb-2 text-xs">
						容器内移动, 当移动到距离边界小于30px时，松开鼠标会自动吸附到边界
					</div>
				</div>
			</div>
		</div>
	);
}

// 屏幕模式示例
function ScreenExample() {
	const { moveRef, position } = useMove<HTMLDivElement>({
		boundary: true,
	});

	return (
		<div className="mb-8">
			<div
				ref={moveRef}
				style={
					position
						? {
								transform: `translate(${position.x}px, ${position.y}px)`,
							}
						: undefined
				}
				className="fixed top-25 left-25 z-10 w-32 h-32 bg-purple-600 text-white rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
			>
				<div className="font-semibold mb-2">屏幕内移动</div>
			</div>
		</div>
	);
}

// 偏移示例
function OffsetExample() {
	const containerRef = useRef<HTMLDivElement>(null);
	const { moveRef, position } = useMove<HTMLDivElement>({
		offset: { top: 20, left: 20, right: 20, bottom: 20 }, // 20px的偏移
		containerRef,
		boundary: true,
	});

	return (
		<div className="mb-8">
			<h3 className="text-lg font-semibold mb-3">边界偏移示例 (20px偏移)</h3>
			<div
				ref={containerRef}
				className="relative w-75 h-75 border-2 border-blue-500 overflow-hidden bg-blue-50 rounded-lg"
			>
				<div
					ref={moveRef}
					style={
						position
							? {
									transform: `translate(${position.x}px, ${position.y}px)`,
									willChange: "transform",
								}
							: undefined
					}
					className="absolute top-10 left-15 w-32 h-32 bg-blue-600 text-white rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
				>
					<div className="font-semibold mb-2 text-xs">容器内移动，不能贴边，有20px的偏移</div>
				</div>
			</div>
		</div>
	);
}

// // 轴向限制示例
function AxisExample() {
	const { moveRef: xMoveRef, position: xPosition } = useMove<HTMLDivElement>({
		axis: "x",
	});

	const { moveRef: yMoveRef, position: yPosition } = useMove<HTMLDivElement>({
		axis: "y",
	});

	return (
		<div className="mb-8">
			<h3 className="text-lg font-semibold mb-3">轴向限制示例</h3>
			<div className="relative w-full h-75 border-2 border-green-500 bg-green-50 rounded-lg">
				<div
					ref={xMoveRef}
					style={
						xPosition
							? {
									transform: `translateX(${xPosition.x}px)`,
									willChange: "transfrom",
								}
							: undefined
					}
					className="w-32 h-20 bg-green-600 text-white rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
				>
					<div className="font-semibold mb-1">X轴移动 →</div>
				</div>
				<div
					ref={yMoveRef}
					style={
						yPosition
							? {
									transform: `translateY(${yPosition.y}px)`,
									willChange: "transfrom",
								}
							: undefined
					}
					className="w-20 h-32 bg-teal-600 text-white rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
				>
					<div className="font-semibold mb-1 text-center">Y轴移动 ↓</div>
				</div>
			</div>
		</div>
	);
}

// 可拖拽的Card组件
function DraggableCard() {
	const [draggable, setDraggable] = useState(true);
	const { position, isMoving, moveRef } = useMove<HTMLDivElement>({
		disabled: !draggable,
	});

	return (
		<Card
			style={
				position
					? {
							transform: `translate(${position.x}px, ${position.y}px)`,
							willChange: "transfrom",
						}
					: undefined
			}
			className={`absolute w-75 shadow-xl`}
		>
			<CardHeader
				ref={moveRef}
				className={`select-none ${isMoving ? "cursor-move" : "cursor-default"}`}
			>
				<CardTitle>可拖拽的卡片</CardTitle>
				<CardDescription>拖拽标题栏来移动卡片</CardDescription>
			</CardHeader>
			<CardContent className="pt-4">
				<p className="mb-2">这是一个可以拖拽的卡片组件。</p>
				<p className="mb-2">只有标题栏可以被拖拽，内容区域不会响应拖拽事件。</p>
				<Button onClick={() => setDraggable((prev) => !prev)}>
					{draggable ? "禁用" : "启用"}拖拽
				</Button>
			</CardContent>
		</Card>
	);
}

// 可拖拽的Dialog组件
function DraggableDialog() {
	return (
		<MovableDialog
			triggerChildren={<Button variant="outline">打开可移动对话框</Button>}
			header={
				<>
					<DialogTitle>可移动对话框</DialogTitle>
					<DialogDescription>尝试拖动标题栏来移动对话框</DialogDescription>
				</>
			}
		>
			<div className="py-4">
				<p className="mb-2">这是一个可以移动的对话框组件。</p>
				<p className="mb-2">尝试拖动标题栏来移动对话框。</p>
			</div>
		</MovableDialog>
	);
}

function MoveFeaturePage() {
	return (
		<div className="p-8 max-w-6xl mx-auto">
			<h1 className="text-3xl font-bold mb-4">useMove Hook 示例</h1>

			<div className="space-y-8">
				<ContainerExample />
				<ScreenExample />
				<OffsetExample />
				<AxisExample />
				<DraggableCard />
				<DraggableDialog />
			</div>
		</div>
	);
}

export default MoveFeaturePage;
