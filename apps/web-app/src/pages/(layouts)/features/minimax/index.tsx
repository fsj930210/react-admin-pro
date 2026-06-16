import { Button } from "@rap/components-ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rap/components-ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { Maximize2, Minimize2, RotateCcw, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/(layouts)/features/minimax/")({
  component: MinimaxFeaturePage,
});

type PanelState = "normal" | "minimized" | "maximized" | "closed";

function MinimaxCardExample() {
  const [state, setState] = useState<PanelState>("normal");

  if (state === "closed") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>任务面板已关闭</CardTitle>
          <CardDescription>关闭后的工作区可以由业务入口重新打开。</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={() => setState("normal")}>
            重新打开
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state === "minimized") {
    return (
      <div className="fixed right-10 bottom-10 z-40 flex h-10 items-center gap-1 rounded-md border bg-background px-2 shadow-lg">
        <button
          type="button"
          className="max-w-32 truncate px-1 text-left text-xs text-muted-foreground"
          onClick={() => setState("normal")}
        >
          后台任务面板
        </button>
        <Button variant="ghost" size="icon-sm" onClick={() => setState("normal")}>
          <RotateCcw />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => setState("maximized")}>
          <Maximize2 />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => setState("closed")}>
          <X />
        </Button>
      </div>
    );
  }

  return (
    <Card
      className={
        state === "maximized"
          ? "fixed inset-4 z-40 overflow-hidden rounded-md bg-background shadow-2xl"
          : undefined
      }
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>后台任务面板</CardTitle>
            <CardDescription>用 Card 演示最小化、最大化、还原和关闭状态。</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => setState("minimized")}>
              <Minimize2 />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setState(state === "maximized" ? "normal" : "maximized")}
            >
              {state === "maximized" ? <RotateCcw /> : <Maximize2 />}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setState("closed")}>
              <X />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={
            state === "maximized"
              ? "grid min-h-[calc(100vh-12rem)] gap-4 lg:grid-cols-[1fr_280px]"
              : "grid gap-4 lg:grid-cols-[1fr_260px]"
          }
        >
          <div className="rounded-md border bg-muted/30 p-4">
            <h3 className="font-medium">任务进度</h3>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-2/3 rounded-full bg-primary" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              当前状态：{state === "maximized" ? "最大化" : "普通"}
              。特性页只展示状态模型，组件页展示真实 Dialog。
            </p>
          </div>
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            <p>最小化会收纳到底部任务条。</p>
            <p className="mt-2">最大化会让卡片占据主要工作区。</p>
            <p className="mt-2">关闭后可以通过业务入口重新打开。</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MinimaxFeaturePage() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Minimax</h1>
        <p className="text-muted-foreground">后台系统里常用的最小化、最大化、恢复和关闭状态。</p>
      </div>
      <MinimaxCardExample />
    </div>
  );
}
