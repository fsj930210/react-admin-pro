/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
import { Button } from "@rap/components-base/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@rap/components-base/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@rap/components-base/dialog";
import { useMove } from "@rap/hooks/use-move";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";

export const Route = createFileRoute("/(layouts)/features/move/")({
  component: MoveFeaturePage,
});

// 容器模式示例
function ContainerExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { moveRef, position, topLeftStyle, onStart } = useMove<HTMLDivElement>({
    containerRef,
  });

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">容器模式限制</h3>
      <div
        ref={containerRef}
        className="relative w-[400px] h-[300px] border-2 border-blue-500 overflow-hidden bg-blue-50 rounded-lg"
      >
        <div
          ref={moveRef}
          onMouseDown={onStart}
          style={topLeftStyle}
          className="absolute w-32 h-32 bg-blue-600 text-white rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
        >
          <div className="font-semibold mb-2">容器内移动</div>
          <div className="text-xs text-center">
            位置: ({Math.round(position.x)}, {Math.round(position.y)})
          </div>
        </div>
      </div>
    </div>
  );
}

// 屏幕模式示例
function ScreenExample() {
  const { moveRef, position, style, onStart } = useMove<HTMLDivElement>({});

  return (
    <div className="mb-8">
      <div
        ref={moveRef}
        onMouseDown={onStart}
        style={style}
        className="fixed top-[100px] left-[100px] z-10 w-32 h-32 bg-purple-600 text-white rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
      >
        <div className="font-semibold mb-2">屏幕内移动</div>
        <div className="text-xs text-center">
          位置: ({Math.round(position.x)}, {Math.round(position.y)})
        </div>
      </div>
    </div>
  );
}

// 偏移示例
function OffsetExample() {
  const { moveRef, position, style, onStart } = useMove<HTMLDivElement>({
    offset: { top: 20, left: 20, right: 20, bottom: 20 }, // 20px的偏移
  });

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">边界偏移示例 (20px偏移)</h3>
      <div className="relative w-full h-[300px] bg-orange-50 rounded-lg">
        <div
          ref={moveRef}
          onMouseDown={onStart}
          style={style}
          className="w-32 h-32 bg-orange-600 text-white rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
        >
          <div className="font-semibold mb-2">偏移移动</div>
          <div className="text-xs text-center">
            位置: ({Math.round(position.x)}, {Math.round(position.y)})
          </div>
        </div>
      </div>
    </div>
  );
}

// 轴向限制示例
function AxisExample() {
  const {
    moveRef: xMoveRef,
    style: xStyle,
    position: xPosition,
    onStart: onXStart,
  } = useMove<HTMLDivElement>({
    axis: "x",
  });

  const {
    moveRef: yMoveRef,
    style: yStyle,
    position: yPosition,
    onStart: onYStart,
  } = useMove<HTMLDivElement>({
    axis: "y",
  });

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">轴向限制示例</h3>
      <div className="relative w-full h-[300px] border-2 border-green-500 bg-green-50 rounded-lg">
        <div
          ref={xMoveRef}
          onMouseDown={onXStart}
          style={xStyle}
          className="w-32 h-20 bg-green-600 text-white rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
        >
          <div className="font-semibold mb-1">X轴移动 →</div>
          <div className="text-xs">X: {Math.round(xPosition.x)}</div>
        </div>
        <div
          ref={yMoveRef}
          onMouseDown={onYStart}
          style={yStyle}
          className="w-20 h-32 bg-teal-600 text-white rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
        >
          <div className="font-semibold mb-1 text-center">Y轴移动 ↓</div>
          <div className="text-xs">Y: {Math.round(yPosition.y)}</div>
        </div>
      </div>
    </div>
  );
}

// 吸附示例
function SnapExample() {
  const { moveRef, position, style, onStart } = useMove<HTMLDivElement>({
    snapToBoundary: true,
    snapThreshold: 30, // 30px吸附距离
  });

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">
        边界吸附示例 (30px吸附距离)
      </h3>
      <div className="relative w-full h-[300px] bg-pink-50 rounded-lg">
        <div
          ref={moveRef}
          onMouseDown={onStart}
          style={style}
          className="w-32 h-32 bg-pink-600 text-white rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
        >
          <div className="font-semibold mb-2">吸附移动</div>
          <div className="text-xs text-center">
            位置: ({Math.round(position.x)}, {Math.round(position.y)})
          </div>
        </div>
      </div>
    </div>
  );
}

// 可拖拽的Card组件
function DraggableCard() {
  const headerRef = useRef<HTMLDivElement>(null);
  const { position, isMoving, onStart } = useMove<HTMLDivElement>({});

  // 只有header可以被拖拽，动态位置需要内联样式
  const cardStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  return (
    <Card
      style={cardStyle}
      className={`absolute w-[300px] shadow-xl ${
        isMoving ? "cursor-grabbing" : "cursor-default"
      }`}
    >
      <CardHeader
        ref={headerRef}
        onMouseDown={onStart}
        className={`select-none bg-gradient-to-r from-blue-600 to-blue-700 text-white ${
          isMoving ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <CardTitle>可拖拽的卡片</CardTitle>
        <CardDescription className="text-blue-100">
          拖拽标题栏来移动卡片
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="mb-2">这是一个可以拖拽的卡片组件。</p>
        <p className="mb-2">只有标题栏可以被拖拽，内容区域不会响应拖拽事件。</p>
        <p className="font-semibold text-blue-600">
          当前位置: ({Math.round(position.x)}, {Math.round(position.y)})
        </p>
      </CardContent>
    </Card>
  );
}

// 可拖拽的Dialog组件
function DraggableDialog() {
  const headerRef = useRef<HTMLDivElement>(null);
  const { position, isMoving, reset, onStart } = useMove<HTMLDivElement>({});

  // 动态位置需要内联样式
  const dialogStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">打开可拖拽对话框</Button>
      </DialogTrigger>
      <DialogContent
        style={dialogStyle}
        className="absolute w-[400px] shadow-2xl"
      >
        <DialogHeader
          ref={headerRef}
          onMouseDown={onStart}
          className={`select-none ${
            isMoving ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <DialogTitle>可拖拽的对话框</DialogTitle>
          <DialogDescription>拖拽标题栏来移动对话框</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-2">这是一个可以拖拽的对话框组件。</p>
          <p className="mb-2">只有标题栏可以被拖拽。</p>
          <p className="font-semibold text-purple-600">
            当前位置: ({Math.round(position.x)}, {Math.round(position.y)})
          </p>
          <Button onClick={reset} className="mt-4">
            重置位置
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MoveFeaturePage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">useMove Hook 示例</h1>
      <p className="text-gray-600 mb-8">
        以下是useMove hook的各种使用示例，尝试拖动各种彩色方块体验不同的功能
      </p>

      <div className="space-y-8">
        <ContainerExample />
        <ScreenExample />
        <OffsetExample />
        <AxisExample />
        <SnapExample />

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">特殊组件示例</h3>
          <div className="relative w-full h-[500px] bg-indigo-50 rounded-lg">
            <DraggableCard />
            <div className="absolute bottom-4 left-4">
              <DraggableDialog />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoveFeaturePage;
