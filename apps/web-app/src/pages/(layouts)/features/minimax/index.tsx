import { MinimaxDialog } from "@rap/components-pro/dialog";
import { Button } from "@rap/components-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@rap/components-ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/(layouts)/features/minimax/")({
  component: MinimaxFeaturePage,
});

function MinimaxDialogExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最大最小化 Dialog</CardTitle>
        <CardDescription>支持最小化、最大化、还原和关闭的后台工作窗。</CardDescription>
      </CardHeader>
      <CardContent>
        <MinimaxDialog
          triggerChildren={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              打开 Dialog
            </Button>
          }
          header={<CardTitle>最大最小化 Dialog 示例</CardTitle>}
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
            <p>这个 Dialog 可以最小化成底部条，也可以最大化成全屏工作区。</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>最小化条可以拖动。</li>
              <li>最小化条上有恢复、最大化、关闭按钮。</li>
              <li>关闭按钮会直接关闭 Dialog。</li>
              <li>最大化和还原有过渡动画。</li>
            </ul>
          </div>
        </MinimaxDialog>
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-sm text-muted-foreground">点击按钮打开示例 Dialog。</span>
      </CardFooter>
    </Card>
  );
}

function MinimaxFeaturePage() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Minimax Dialog</h1>
        <p className="text-muted-foreground">后台系统里常用的最小化、最大化和恢复能力。</p>
      </div>
      <MinimaxDialogExample />
    </div>
  );
}

export default MinimaxFeaturePage;
