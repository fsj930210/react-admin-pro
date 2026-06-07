import { MovableDialog } from "@rap/components-pro/dialog";
import { Button } from "@rap/components-ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rap/components-ui/card";
import { DialogDescription, DialogTitle } from "@rap/components-ui/dialog";
import { useMove } from "@rap/hooks/use-move";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

export const Route = createFileRoute("/(layouts)/features/move/")({
  component: MoveFeaturePage,
});

function ContainerExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { targetRef, style } = useMove<HTMLDivElement>({
    bounds: containerRef,
    boundaryMode: "contain",
  });

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">容器内移动</h2>
      <div
        ref={containerRef}
        className="relative h-75 w-75 overflow-hidden rounded-lg border-2 border-blue-500 bg-blue-50"
      >
        <div
          ref={targetRef}
          style={style}
          className="absolute top-10 left-15 flex h-32 w-32 touch-none select-none items-center justify-center rounded-lg bg-blue-600 p-4 text-center text-sm font-medium text-white shadow-lg"
        >
          拖动我，整体不会超出容器
        </div>
      </div>
    </section>
  );
}

function ScreenExample() {
  const { targetRef, style } = useMove<HTMLDivElement>();

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">视口内移动</h2>
      <div
        ref={targetRef}
        style={style}
        className="fixed top-25 left-25 z-10 flex h-32 w-32 touch-none select-none items-center justify-center rounded-lg bg-purple-600 p-4 text-center font-medium text-white shadow-lg"
      >
        默认保留可抓取区域
      </div>
    </section>
  );
}

function AxisExample() {
  const { targetRef: xRef, style: xStyle } = useMove<HTMLDivElement>({ axis: "x" });
  const { targetRef: yRef, style: yStyle } = useMove<HTMLDivElement>({ axis: "y" });

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">轴向限制</h2>
      <div className="relative h-75 rounded-lg border-2 border-green-500 bg-green-50">
        <div
          ref={xRef}
          style={xStyle}
          className="flex h-20 w-32 touch-none select-none items-center justify-center rounded-lg bg-green-600 p-4 text-white shadow-lg"
        >
          只能 X 轴
        </div>
        <div
          ref={yRef}
          style={yStyle}
          className="mt-4 flex h-32 w-24 touch-none select-none items-center justify-center rounded-lg bg-teal-600 p-4 text-center text-white shadow-lg"
        >
          只能 Y 轴
        </div>
      </div>
    </section>
  );
}

function DraggableCard() {
  const [draggable, setDraggable] = useState(true);
  const { targetRef, handleRef, style, isMoving } = useMove<HTMLDivElement, HTMLDivElement>({
    disabled: !draggable,
  });

  return (
    <Card ref={targetRef} style={style} className="absolute w-75 shadow-xl">
      <CardHeader ref={handleRef} className="touch-none select-none cursor-move">
        <CardTitle>可拖动的 Card</CardTitle>
        <CardDescription>{isMoving ? "正在移动" : "拖动标题栏移动卡片"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <p>target 是整张卡片，handle 是标题栏。</p>
        <Button onClick={() => setDraggable((prev) => !prev)}>
          {draggable ? "禁用" : "启用"}移动
        </Button>
      </CardContent>
    </Card>
  );
}

function DraggableDialog() {
  return (
    <MovableDialog
      triggerChildren={<Button variant="outline">打开可移动 Dialog</Button>}
      header={
        <>
          <DialogTitle>可移动 Dialog</DialogTitle>
          <DialogDescription>拖动标题栏，Dialog 会从当前居中位置开始移动。</DialogDescription>
        </>
      }
    >
      <div className="py-4">
        <p>这个 Dialog 不需要手动绑定事件，portal 挂载后 callback ref 会自动接管。</p>
      </div>
    </MovableDialog>
  );
}

function MoveFeaturePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">useMove Hook 示例</h1>
      <ContainerExample />
      <ScreenExample />
      <AxisExample />
      <DraggableCard />
      <DraggableDialog />
    </div>
  );
}
