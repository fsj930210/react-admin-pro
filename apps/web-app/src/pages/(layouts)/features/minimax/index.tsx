import { Button } from "@rap/components-base/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@rap/components-base/card";
import { MinimaxDialog } from "@rap/components-ui/dialog";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/(layouts)/features/minimax/")({
	component: MinimaxFeaturePage,
});

function MinimaxDialogExample() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>最小最大化 Dialog</CardTitle>
				<CardDescription>支持最小化、最大化、还原功能的对话框组件</CardDescription>
			</CardHeader>
			<CardContent>
				<MinimaxDialog
					triggerChildren={
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							打开 Dialog
						</Button>
					}
					header={<CardTitle>最小最大化 Dialog 示例</CardTitle>}
					actions={{
						close: true,
						minimize: true,
						maximize: true,
					}}
					minimizedBar={{
						draggable: true,
						initialPosition: { right: 100, bottom: 60 },
					}}
				>
					<div className="py-4">
						<p>这是对话框的内容区域。</p>
						<p className="mt-2">你可以对其进行任意操作：</p>
						<ul className="list-disc list-inside mt-2 space-y-1">
							<li>点击最小化按钮，对话框将最小化到右下角</li>
							<li>点击最大化按钮，对话框将全屏显示</li>
							<li>再次点击可还原到正常大小</li>
							<li>最小化后可以拖动到底部的小圆点</li>
						</ul>
					</div>
				</MinimaxDialog>
			</CardContent>
			<CardFooter className="flex justify-between">
				<span className="text-sm text-muted-foreground">点击按钮打开示例对话框</span>
			</CardFooter>
		</Card>
	);
}

function MinimaxFeaturePage() {
	return (
		<div className="p-6 space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Minimax Dialog</h1>
				<p className="text-muted-foreground">支持最小化、最大化、还原功能的对话框组件</p>
			</div>

			<MinimaxDialogExample />
		</div>
	);
}
