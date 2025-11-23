/** biome-ignore-all lint:a11y/noStaticElementInteractions */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@rap/components-base/dialog";
import { type UseMovableOptions, useMovable } from "@rap/hooks/use-movable";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/(layouts)/features/move/")({
  component: MoveFeaturePage,
});

// 固定边界组件
function FixedBoundaryExample() {
  const options: UseMovableOptions = {
    initialPosition: { x: 50, y: 50 },
    boundary: {
      left: 0,
      right: 600, // 边界指示器的实际宽度
      top: 0,
      bottom: 400, // 边界指示器的实际高度
    },
    axis: "both",
    snapToBoundary: true,
    snapThreshold: 15,
  };

  const {
    ref,
    style,
    isDragging,
    position,
    reset,
    setPosition,
    onMouseDown,
    onTouchStart,
  } = useMovable<HTMLDivElement>(options);

  return (
    <div style={{ position: "relative", height: "500px" }}>
      <h3>固定边界模式</h3>

      {/* 边界指示器 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 40,
          width: 600,
          height: 400,
          border: "2px dashed #2196F3",
          borderRadius: "4px",
          backgroundColor: "rgba(33, 150, 243, 0.05)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20px",
            left: 0,
            fontSize: "12px",
            color: "#2196F3",
          }}
        >
          固定边界范围 (0-480, 0-320)
        </div>
      </div>

      {/* 可拖拽元素 */}
      <div
        ref={ref}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          ...style,
          position: "absolute",
          top: 40,
          left: 0,
          width: 120,
          height: 80,
          background: `linear-gradient(135deg, ${
            isDragging ? "#ff6b6b" : "#4ecdc4"
          }, ${isDragging ? "#feca57" : "#44a3aa"})`,
          color: "white",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          fontSize: "12px",
          boxShadow: isDragging
            ? "0 8px 24px rgba(0,0,0,0.3)"
            : "0 4px 12px rgba(0,0,0,0.15)",
          transition: isDragging ? "none" : "all 0.3s ease",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div>固定边界</div>
          <div style={{ fontSize: "10px", marginTop: "2px" }}>
            ({Math.round(position.x)}, {Math.round(position.y)})
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          重置位置
        </button>
        <button
          type="button"
          onClick={() => setPosition({ x: 480, y: 320 })}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          设置到最右下角
        </button>
      </div>

      {/* 状态显示 */}
      <div style={{ marginTop: "15px", fontSize: "12px", color: "#666" }}>
        <div>
          当前位置: ({Math.round(position.x)}, {Math.round(position.y)})
        </div>
        <div>拖拽状态: {isDragging ? "拖拽中" : "静止"}</div>
        <div>边界范围: x: 0-480, y: 0-320</div>
        <div>边界吸附: 启用 (阈值: 15px)</div>
      </div>
    </div>
  );
}

// 容器边界组件
function ContainerBoundaryExample() {
  const [containerElement, setContainerElement] =
    React.useState<HTMLElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 当容器挂载后设置元素引用
  React.useEffect(() => {
    if (containerRef.current) {
      setContainerElement(containerRef.current);
    }
  }, []);

  const options: UseMovableOptions = {
    initialPosition: { x: 10, y: 10 },
    container: {
      element: containerElement,
      offset: 0, // 不使用偏移，让元素能到达真正的边缘
    },
    axis: "both",
    snapToBoundary: true,
    snapThreshold: 15,
  };

  const {
    ref,
    style,
    isDragging,
    position,
    reset,
    setPosition,
    onMouseDown,
    onTouchStart,
  } = useMovable<HTMLDivElement>(options);

  return (
    <div style={{ position: "relative", height: "500px" }}>
      <h3>容器边界模式</h3>

      {/* 容器 */}
      <div
        ref={containerRef}
        style={{
          width: 700,
          height: 400,
          border: "2px solid #4CAF50",
          borderRadius: "8px",
          position: "relative",
          backgroundColor: "#f1f8e9",
        }}
      >
        {/* 可拖拽元素 - 作为容器的子元素 */}
        <div
          ref={ref}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          style={{
            ...style,
            position: "absolute",
            width: 120,
            height: 80,
            background: `linear-gradient(135deg, ${
              isDragging ? "#ff6b6b" : "#4CAF50"
            }, ${isDragging ? "#feca57" : "#66bb6a"})`,
            color: "white",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            fontSize: "12px",
            boxShadow: isDragging
              ? "0 8px 24px rgba(0,0,0,0.3)"
              : "0 4px 12px rgba(0,0,0,0.15)",
            transition: isDragging ? "none" : "all 0.3s ease",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div>容器边界</div>
            <div style={{ fontSize: "10px", marginTop: "2px" }}>
              ({Math.round(position.x)}, {Math.round(position.y)})
            </div>
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          重置位置
        </button>
        <button
          type="button"
          onClick={() => setPosition({ x: 580, y: 320 })}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          设置到最右下角
        </button>
      </div>

      {/* 状态显示 */}
      <div style={{ marginTop: "15px", fontSize: "12px", color: "#666" }}>
        <div>
          当前位置: ({Math.round(position.x)}, {Math.round(position.y)})
        </div>
        <div>拖拽状态: {isDragging ? "拖拽中" : "静止"}</div>
        <div>容器大小: 700x400</div>
        <div>元素大小: 120x80</div>
        <div>边界吸附: 启用 (阈值: 15px)</div>
      </div>
    </div>
  );
}

// 屏幕边界组件
function ScreenBoundaryExample() {
  const options: UseMovableOptions = {
    initialPosition: { x: 100, y: 100 },
    axis: "both",
    snapToBoundary: true,
    snapThreshold: 15,
  };

  const {
    ref,
    style,
    isDragging,
    position,
    reset,
    setPosition,
    onMouseDown,
    onTouchStart,
  } = useMovable<HTMLDivElement>(options);

  return (
    <div style={{ position: "relative", height: "500px" }}>
      <h3>屏幕边界模式</h3>

      {/* 屏幕边界指示器 */}
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          border: "2px dashed #9C27B0",
          borderRadius: "4px",
          backgroundColor: "rgba(156, 39, 176, 0.05)",
          pointerEvents: "none",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            fontSize: "12px",
            color: "#9C27B0",
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          屏幕边界范围 (整个视口)
        </div>
      </div>

      {/* 可拖拽元素 - fixed 定位 */}
      <div
        ref={ref}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          ...style,
          position: "fixed",
          top: 0,
          left: 0,
          width: 120,
          height: 80,
          background: `linear-gradient(135deg, ${
            isDragging ? "#ff6b6b" : "#9C27B0"
          }, ${isDragging ? "#feca57" : "#ba68c8"})`,
          color: "white",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          fontSize: "12px",
          boxShadow: isDragging
            ? "0 8px 24px rgba(0,0,0,0.3)"
            : "0 4px 12px rgba(0,0,0,0.15)",
          transition: isDragging ? "none" : "all 0.3s ease",
          zIndex: 1001,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div>屏幕边界</div>
          <div style={{ fontSize: "10px", marginTop: "2px" }}>
            ({Math.round(position.x)}, {Math.round(position.y)})
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          重置位置
        </button>
        <button
          type="button"
          onClick={() =>
            setPosition({
              x: window.innerWidth - 120,
              y: window.innerHeight - 80,
            })
          }
          style={{
            padding: "8px 16px",
            backgroundColor: "#9C27B0",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          设置到最右下角
        </button>
      </div>

      {/* 状态显示 */}
      <div style={{ marginTop: "15px", fontSize: "12px", color: "#666" }}>
        <div>
          当前位置: ({Math.round(position.x)}, {Math.round(position.y)})
        </div>
        <div>拖拽状态: {isDragging ? "拖拽中" : "静止"}</div>
        <div>
          屏幕大小: {window.innerWidth}x{window.innerHeight}
        </div>
        <div>元素大小: 120x80</div>
        <div>边界吸附: 启用 (阈值: 15px)</div>
      </div>
    </div>
  );
}

// 可拖拽对话框组件
function DraggableDialogExample() {
  const [isOpen, setIsOpen] = React.useState(false);

  // 计算屏幕中心位置
  const getCenterPosition = React.useCallback((): { x: number; y: number } => {
    const dialogWidth = 500; // 对话框宽度
    const dialogHeight = 400; // 预估对话框高度
    return {
      x: Math.max(0, (window.innerWidth - dialogWidth) / 2),
      y: Math.max(0, (window.innerHeight - dialogHeight) / 2),
    };
  }, []);

  // 使用 useMovable hook，设置初始位置为屏幕中心
  const { ref, topLeftStyle, isDragging, position, reset, onMouseDown } =
    useMovable<HTMLDivElement>({
      initialPosition: getCenterPosition(),
      axis: "both",
      snapToBoundary: true,
      snapThreshold: 15,
      positionMode: "topLeft",
    });

  return (
    <div style={{ position: "relative", height: "500px" }}>
      <h3>可拖拽对话框示例</h3>
      <p style={{ marginBottom: "20px", color: "#666" }}>
        点击按钮打开对话框，只能拖动对话框的标题栏部分，在屏幕范围内自由移动。
      </p>

      {/* 打开对话框的按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          padding: "12px 24px",
          backgroundColor: "#FF5722",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          boxShadow: "0 4px 12px rgba(255, 87, 34, 0.3)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 87, 34, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 87, 34, 0.3)";
        }}
      >
        打开可拖拽对话框
      </button>

      {/* 可拖拽对话框 */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          ref={ref}
          style={{
            ...topLeftStyle,
            cursor: isDragging ? "grabbing" : "default",
          }}
        >
          {/* 可拖拽的标题栏 */}
          <DialogHeader
            onMouseDown={onMouseDown}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
              padding: "16px 24px 12px",
              borderBottom: "1px solid #e2e8f0",
              background: "linear-gradient(135deg, #FF5722, #FF7043)",
              color: "white",
              borderRadius: "8px 8px 0 0",
              margin: "-24px -24px 16px -24px",
            }}
          >
            <DialogTitle
              style={{ color: "white", fontSize: "18px", fontWeight: "bold" }}
            >
              可拖拽对话框
            </DialogTitle>
            <DialogDescription
              style={{ color: "rgba(255,255,255,0.9)", marginTop: "4px" }}
            >
              这是一个可以拖拽的对话框，拖动标题栏来移动位置
            </DialogDescription>
          </DialogHeader>

          {/* 对话框内容 */}
          <div style={{ padding: "20px 24px" }}>
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>对话框内容</h4>
              <p style={{ margin: "0", lineHeight: "1.5", color: "#666" }}>
                这是对话框的主要内容区域。只有标题栏可以拖拽，内容区域保持正常的交互功能。
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>拖拽信息</h4>
              <div
                style={{ fontSize: "14px", color: "#666", lineHeight: "1.4" }}
              >
                <div>
                  当前位置: ({Math.round(position.x)}, {Math.round(position.y)})
                </div>
                <div>拖拽状态: {isDragging ? "拖拽中" : "静止"}</div>
                <div>边界限制: 屏幕范围</div>
                <div>拖拽方式: 仅标题栏可拖拽</div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>功能特性</h4>
              <ul
                style={{
                  margin: "0",
                  paddingLeft: "20px",
                  color: "#666",
                  lineHeight: "1.4",
                }}
              >
                <li>使用 useMovable Hook 实现</li>
                <li>仅标题栏可拖拽，内容区域保持正常交互</li>
                <li>屏幕边界自动限制</li>
                <li>边界吸附功能（15px 阈值）</li>
                <li>平滑的拖拽动画效果</li>
              </ul>
            </div>

            {/* 操作按钮 */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => reset()}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                重置位置
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#FF5722",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                关闭对话框
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 状态显示 */}
      <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        <div>对话框状态: {isOpen ? "已打开" : "已关闭"}</div>
        <div>拖拽方式: 仅标题栏可拖拽</div>
        <div>边界限制: 屏幕范围</div>
      </div>
    </div>
  );
}

// 主页面组件
function MoveFeaturePage() {
  const [mode, setMode] = React.useState<
    "fixed" | "container" | "screen" | "dialog"
  >("fixed");

  return (
    <div style={{ padding: "20px" }}>
      <h2>useMovable Hook 演示</h2>

      {/* 模式切换按钮 */}
      <div style={{ marginBottom: "30px", display: "flex", gap: "10px" }}>
        <button
          type="button"
          onClick={() => setMode("fixed")}
          style={{
            padding: "10px 20px",
            backgroundColor: mode === "fixed" ? "#2196F3" : "#e0e0e0",
            color: mode === "fixed" ? "white" : "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          固定边界
        </button>
        <button
          type="button"
          onClick={() => setMode("container")}
          style={{
            padding: "10px 20px",
            backgroundColor: mode === "container" ? "#4CAF50" : "#e0e0e0",
            color: mode === "container" ? "white" : "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          容器边界
        </button>
        <button
          type="button"
          onClick={() => setMode("screen")}
          style={{
            padding: "10px 20px",
            backgroundColor: mode === "screen" ? "#9C27B0" : "#e0e0e0",
            color: mode === "screen" ? "white" : "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          屏幕边界
        </button>
        <button
          type="button"
          onClick={() => setMode("dialog")}
          style={{
            padding: "10px 20px",
            backgroundColor: mode === "dialog" ? "#FF5722" : "#e0e0e0",
            color: mode === "dialog" ? "white" : "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          可拖拽对话框
        </button>
      </div>

      {/* 根据模式显示对应的组件 */}
      {mode === "fixed" && <FixedBoundaryExample />}
      {mode === "container" && <ContainerBoundaryExample />}
      {mode === "screen" && <ScreenBoundaryExample />}
      {mode === "dialog" && <DraggableDialogExample />}
    </div>
  );
}
