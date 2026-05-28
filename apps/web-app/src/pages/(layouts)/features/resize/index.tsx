import { ResizableDialog } from "@rap/components-pro/dialog";
import { Button } from "@rap/components-ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rap/components-ui/card";
import { DialogTitle } from "@rap/components-ui/dialog";
import { useResize } from "@rap/hooks/use-resize";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(layouts)/features/resize/")({
	component: ResizeFeaturePage,
});

function ResizableBlock() {
	const [resizable, setResizable] = useState(true);
	const { targetRef, style, size, cursor } = useResize<HTMLDivElement>({
		disabled: !resizable,
		edgeResize: true,
		edgeSize: 14,
		cornerSize: 32,
		minSize: { width: 150, height: 150 },
		maxSize: { width: 420, height: 420 },
	});

	return (
		<div
			ref={targetRef}
			style={{
				...style,
				width: size ? style.width : 250,
				height: size ? style.height : 250,
			}}
			className="relative rounded-lg border-2 border-border bg-background shadow-md"
		>
			<div className="space-y-3 p-4">
				<h3 className="font-medium">边缘 resize</h3>
				<p className="text-sm">角落命中区更大，拖到四个角时会同时改变宽和高。</p>
				<p className="text-sm">当前尺寸：{size ? `${Math.round(size.width)} x ${Math.round(size.height)}` : "250 x 250"}</p>
				<Button onClick={() => setResizable((prev) => !prev)} variant="outline" size="sm">
					{resizable ? "禁用" : "启用"} resize
				</Button>
				<p className="text-xs text-muted-foreground">cursor: {cursor}</p>
			</div>
		</div>
	);
}

function ResizableCard() {
	const { targetRef, getHandleProps, style, size } = useResize<HTMLDivElement>({
		minSize: { width: 220, height: 160 },
		maxSize: { width: 640, height: 520 },
		bounds: false,
	});

	const handleProps = getHandleProps("se");

	return (
		<Card
			ref={targetRef}
			style={{
				...style,
				width: size ? style.width : 320,
			}}
			className="relative overflow-visible"
		>
			<CardHeader>
				<CardTitle>显式 handle resize</CardTitle>
				<CardDescription>右下角 handle 更适合精细组件。</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3 pt-4">
				<p>当前尺寸：{size ? `${Math.round(size.width)} x ${Math.round(size.height)}` : "320 x auto"}</p>
			</CardContent>
			<div
				{...handleProps}
				className="absolute right-1 bottom-1 h-4 w-4 rounded-sm border-r-2 border-b-2 border-muted-foreground/70"
			/>
		</Card>
	);
}

function ResizableDrawer() {
	const [open, setOpen] = useState(false);
	const { targetRef, getHandleProps, size } = useResize<HTMLDivElement>({
		directions: ["w"],
		minSize: { width: 280 },
		maxSize: { width: 720 },
		bounds: "viewport",
	});
	const handleProps = getHandleProps("w");

	return (
		<>
			<Button onClick={() => setOpen(true)}>打开可调整宽度 Drawer</Button>
			{open && (
				<div
					ref={targetRef}
					className="fixed top-0 right-0 z-50 h-screen border-l bg-background p-6 shadow-xl"
					style={{ width: size ? `${size.width}px` : 380 }}
				>
					<div
						{...handleProps}
						className="absolute top-0 -left-2 h-full w-4 touch-none bg-transparent"
					/>
					<div className="flex items-start justify-between gap-4">
						<div>
							<h3 className="text-lg font-semibold">Resizable Drawer</h3>
							<p className="mt-2 text-sm text-muted-foreground">拖动左边缘改变宽度，右侧保持贴边。</p>
						</div>
						<Button variant="outline" size="sm" onClick={() => setOpen(false)}>
							关闭
						</Button>
					</div>
					<div className="mt-6 rounded-md border p-4 text-sm">
						当前宽度：{size ? `${Math.round(size.width)}px` : "380px"}
					</div>
				</div>
			)}
		</>
	);
}

function ResizeFeaturePage() {
	return (
		<div className="relative min-h-[800px] space-y-8 p-6">
			<h1 className="text-2xl font-bold">useResize Hook 示例</h1>
			<section className="space-y-4">
				<h2 className="text-xl font-semibold">1. 普通块</h2>
				<ResizableBlock />
			</section>
			<section className="space-y-4">
				<h2 className="text-xl font-semibold">2. Card</h2>
				<ResizableCard />
			</section>
			<section className="space-y-4">
				<h2 className="text-xl font-semibold">3. Dialog</h2>
				<ResizableDialog
					header={<DialogTitle>可调整尺寸的 Dialog</DialogTitle>}
					triggerChildren={<Button>打开 Dialog</Button>}
				// resizeOptions={{
				// 	minSize: { width: 320, height: 200 },
				// 	maxSize: { width: 1000, height: 800 },
				// }}
				>
					<p>Dialog 使用显式的 8 个 resize handle；拖四个角时会稳定地同时改变宽和高。</p>
				</ResizableDialog>
			</section>
			<section className="space-y-4">
				<h2 className="text-xl font-semibold">4. Drawer</h2>
				<ResizableDrawer />
			</section>
		</div>
	);
}

export default ResizeFeaturePage;
