import * as React from "react";

/**
 * 解析 transform 值并计算像素偏移量
 * 支持 style 中的 transform 和 TailwindCSS 的 translate-x/translate-y 类
 */
// function parseTransformOffset(
//   element: HTMLElement,
//   computedStyle: CSSStyleDeclaration
// ): { x: number; y: number } {
//   let offsetX = 0;
//   let offsetY = 0;

//   // 1. 首先检查 style 中的 transform
//   const styleTransform = element.style.transform;
//   if (styleTransform && styleTransform !== "none") {
//     // 解析 translate(Xpx, Ypx) 格式
//     const translateMatch = styleTransform.match(
//       /translate\(([-\d.]+)(?:px)?\s*,\s*([-\d.]+)(?:px)?\)/
//     );
//     if (translateMatch) {
//       offsetX = parseFloat(translateMatch[1]);
//       offsetY = parseFloat(translateMatch[2]);
//     }

//     // 解析 translateX(Xpx) 格式
//     const translateXMatch = styleTransform.match(/translateX\(([-\d.]+)px\)/);
//     if (translateXMatch) {
//       offsetX = parseFloat(translateXMatch[1]);
//     }

//     // 解析 translateY(Ypx) 格式
//     const translateYMatch = styleTransform.match(/translateY\(([-\d.]+)px\)/);
//     if (translateYMatch) {
//       offsetY = parseFloat(translateYMatch[1]);
//     }
//   }

//   // 2. 检查 computedStyle 中的 transform（包含 TailwindCSS 类的计算结果）
//   const computedTransform = computedStyle.transform;
//   if (computedTransform && computedTransform !== "none") {
//     // 解析 matrix 或 matrix3d 中的偏移
//     const matrixMatch = computedTransform.match(
//       /matrix(?:3d)?\(([-\d.]+(?:,\s*[-\d.]+)*)\)/
//     );
//     if (matrixMatch) {
//       const values = matrixMatch[1].split(/,\s*/).map(parseFloat);
//       if (values.length >= 6) {
//         // matrix(a, b, c, d, e, f) 中的 e, f 是 x, y 偏移
//         offsetX = values[4] || 0;
//         offsetY = values[5] || 0;
//       }
//     }
//   }

//   // 3. 解析 TailwindCSS translate-x/translate-y 类
//   const classList: string[] = [];
//   for (let i = 0; i < element.classList.length; i++) {
//     classList.push(element.classList[i]);
//   }

//   for (const className of classList) {
//     // 解析 translate-x-[-xx%] 或 translate-x-[xx%] 格式
//     const translateXMatch = className.match(
//       /translate-x-\[(-?\d+(?:\.\d+)?)%\]/
//     );
//     if (translateXMatch) {
//       const percentage = parseFloat(translateXMatch[1]);
//       const rect = element.getBoundingClientRect();
//       offsetX = (rect.width * percentage) / 100;
//     }

//     // 解析 translate-y-[-xx%] 或 translate-y-[xx%] 格式
//     const translateYMatch = className.match(
//       /translate-y-\[(-?\d+(?:\.\d+)?)%\]/
//     );
//     if (translateYMatch) {
//       const percentage = parseFloat(translateYMatch[1]);
//       const rect = element.getBoundingClientRect();
//       offsetY = (rect.height * percentage) / 100;
//     }
//   }

//   return { x: offsetX, y: offsetY };
// }

/**
 * 计算元素的最终位置（转换为绝对的 top/left 像素值）
 * 考虑百分比定位和 transform 偏移
 */
function computeElementPosition(
  element: HTMLElement,
  computedStyle: CSSStyleDeclaration
): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  // const transformOffset = parseTransformOffset(element, computedStyle);

  // 解析 top 和 left 值
  const top = computedStyle.top;
  const left = computedStyle.left;

  let finalX = rect.left;
  let finalY = rect.top;

  // 如果 top/left 是百分比，需要计算基于视口的像素值
  if (left && left.indexOf("%") !== -1) {
    const leftPercent = parseFloat(left);
    finalX = (window.innerWidth * leftPercent) / 100;
  }

  if (top && top.indexOf("%") !== -1) {
    const topPercent = parseFloat(top);
    finalY = (window.innerHeight * topPercent) / 100;
  }

  // 如果是 auto 或其他值，使用 getBoundingClientRect 的值
  if (left === "auto" || !left) {
    finalX = rect.left;
  }

  if (top === "auto" || !top) {
    finalY = rect.top;
  }

  // 加上 transform 偏移（但是要去掉，因为我们要转换为纯 top/left）
  // finalX += transformOffset.x;
  // finalY += transformOffset.y;

  return { x: finalX, y: finalY };
}

/**
 * 边界配置接口
 */
export interface Boundary {
  /** 左边界 */
  left?: number;
  /** 右边界 */
  right?: number;
  /** 上边界 */
  top?: number;
  /** 下边界 */
  bottom?: number;
}

/**
 * 容器配置接口
 */
export interface Container {
  /** 容器元素引用 */
  element: HTMLElement | null;
  /** 容器的边界偏移量 */
  offset?: number;
}

/**
 * 位置信息接口
 */
export interface Position {
  /** X 坐标 */
  x: number;
  /** Y 坐标 */
  y: number;
}

/**
 * 拖拽状态接口
 */
export interface DragState {
  /** 是否正在拖拽 */
  isDragging: boolean;
  /** 起始位置 */
  startPosition: Position;
  /** 当前位置 */
  currentPosition: Position;
  /** 拖拽偏移量 */
  offset: Position;
}

/**
 * useMovable hook 的配置选项
 */
export interface UseMovableOptions {
  /** 初始位置 */
  initialPosition?: Position;
  /** 固定边界 */
  boundary?: Boundary;
  /** 容器边界 */
  container?: Container;
  /** 是否禁用拖拽 */
  disabled?: boolean;
  /** 拖拽开始时的回调 */
  onDragStart?: (position: Position) => void;
  /** 拖拽过程中的回调 */
  onDrag?: (position: Position) => void;
  /** 拖拽结束时的回调 */
  onDragEnd?: (position: Position) => void;
  /** 轴向限制 */
  axis?: "x" | "y" | "both";
  /** 是否吸附到边界 */
  snapToBoundary?: boolean;
  /** 边界吸附距离 */
  snapThreshold?: number;
  /** 定位模式：transform 或 top/left */
  positionMode?: "transform" | "topLeft";
}

/**
 * useMovable hook 的返回值
 */
export interface UseMovableReturn<T extends HTMLElement = HTMLElement> {
  /** 元素引用 */
  ref: React.RefObject<T | null>;
  /** 当前位置 */
  position: Position;
  /** 是否正在拖拽 */
  isDragging: boolean;
  /** 样式对象，包含 transform 或 top/left 属性 */
  style: React.CSSProperties;
  /** top/left 样式对象，适用于 Dialog 等已使用 top/left 定位的组件 */
  topLeftStyle: React.CSSProperties;
  /** transform 样式对象，适用于普通元素 */
  transformStyle: React.CSSProperties;
  /** 重置位置 */
  reset: () => void;
  /** 设置位置 */
  setPosition: (position: Position) => void;
  /** 鼠标按下事件处理器 */
  onMouseDown: React.MouseEventHandler<T>;
  /** 触摸开始事件处理器 */
  onTouchStart: React.TouchEventHandler<T>;
}

/**
 * 高性能可拖拽 Hook
 *
 * @param options - 配置选项
 * @returns 拖拽相关的状态和方法
 *
 * @example
 * ```tsx
 * const { ref, style, isDragging } = useMovable({
 *   initialPosition: { x: 100, y: 100 },
 *   onDragEnd: (position) => {
 *     console.log('拖拽结束位置:', position);
 *   }
 * });
 *
 * return (
 *   <div
 *     ref={ref}
 *     style={{
 *       ...style,
 *       width: 200,
 *       height: 150,
 *       backgroundColor: isDragging ? '#e0e0e0' : '#f5f5f5',
 *       cursor: isDragging ? 'grabbing' : 'grab',
 *       userSelect: 'none'
 *     }}
 *   >
 *   可拖拽元素
 *   </div>
 * );
 * ```
 */
export function useMovable<T extends HTMLElement = HTMLElement>(
  options: UseMovableOptions = {}
): UseMovableReturn<T> {
  const {
    initialPosition,
    boundary,
    container,
    disabled = false,
    onDragStart,
    onDrag,
    onDragEnd,
    axis = "both",
    snapToBoundary = false,
    snapThreshold = 10,
    positionMode = "transform",
  } = options;

  // 元素引用
  const ref = React.useRef<T>(null);

  // 获取元素的实际位置
  const getElementPosition = React.useCallback((): Position => {
    if (!ref.current) return { x: 0, y: 0 };

    const rect = ref.current.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(ref.current);

    // 如果有 initialPosition，直接使用
    if (initialPosition) {
      return initialPosition;
    }

    // 否则尝试从当前样式中解析位置
    if (positionMode === "topLeft") {
      // 对于 topLeft 模式，使用新的帮助函数计算最终位置
      // 这会考虑百分比定位和各种 transform 偏移
      return computeElementPosition(ref.current, computedStyle);
    } else {
      // 对于 transform 模式，从 transform 中解析
      const transform = computedStyle.transform;
      if (transform && transform !== "none") {
        const match = transform.match(
          /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/
        );
        if (match) {
          return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
        }
      }

      // 如果没有 transform，使用 getBoundingClientRect
      return { x: rect.left, y: rect.top };
    }
  }, [initialPosition, positionMode]);

  // 获取初始位置
  const getInitialPosition = React.useCallback((): Position => {
    return initialPosition ?? getElementPosition();
  }, [initialPosition, getElementPosition]);

  // 拖拽状态
  const [dragState, setDragState] = React.useState<DragState>(() => {
    const initialPos = getInitialPosition();
    return {
      isDragging: false,
      startPosition: initialPos,
      currentPosition: initialPos,
      offset: { x: 0, y: 0 },
    };
  });

  // 使用 ref 来存储最新的位置，避免闭包问题
  const positionRef = React.useRef<Position>(dragState.currentPosition);
  const dragStateRef = React.useRef<DragState>(dragState);

  // 同步 ref 和 state
  React.useEffect(() => {
    positionRef.current = dragState.currentPosition;
    dragStateRef.current = dragState;
  }, [dragState]);

  // 获取有效的边界
  const getEffectiveBoundary = React.useCallback((): Boundary => {
    const effectiveBoundary: Boundary = {};

    // 如果有固定边界，优先使用
    if (boundary) {
      if (boundary.left !== undefined) effectiveBoundary.left = boundary.left;
      if (boundary.right !== undefined)
        effectiveBoundary.right = boundary.right;
      if (boundary.top !== undefined) effectiveBoundary.top = boundary.top;
      if (boundary.bottom !== undefined)
        effectiveBoundary.bottom = boundary.bottom;
    }

    // 如果有容器，计算容器边界
    if (container?.element) {
      const containerRect = container.element.getBoundingClientRect();
      const offset = container.offset || 0;

      // 容器边界：容器的实际边界值（相对于容器坐标系）
      effectiveBoundary.left = effectiveBoundary.left ?? offset;
      effectiveBoundary.right =
        effectiveBoundary.right ?? containerRect.width - offset;
      effectiveBoundary.top = effectiveBoundary.top ?? offset;
      effectiveBoundary.bottom =
        effectiveBoundary.bottom ?? containerRect.height - offset;
    }

    // 如果没有设置任何边界，使用屏幕边界
    if (Object.keys(effectiveBoundary).length === 0) {
      // 屏幕边界：整个视口的范围
      effectiveBoundary.left = 0;
      effectiveBoundary.right = window.innerWidth;
      effectiveBoundary.top = 0;
      effectiveBoundary.bottom = window.innerHeight;
    }

    return effectiveBoundary;
  }, [boundary, container]);

  // 限制位置在边界内
  const constrainPosition = React.useCallback(
    (position: Position): Position => {
      const bounds = getEffectiveBoundary();
      const elementRect = ref.current?.getBoundingClientRect();

      if (Object.keys(bounds).length === 0) {
        return position;
      }

      let constrainedX = position.x;
      let constrainedY = position.y;

      // 获取元素尺寸 - 优先使用明确设置的尺寸
      const elementStyle = ref.current
        ? window.getComputedStyle(ref.current)
        : null;
      let elementWidth = elementRect?.width || 0;
      let elementHeight = elementRect?.height || 0;

      if (elementStyle) {
        const parsedWidth = parseInt(elementStyle.width);
        const parsedHeight = parseInt(elementStyle.height);
        if (!isNaN(parsedWidth)) elementWidth = parsedWidth;
        if (!isNaN(parsedHeight)) elementHeight = parsedHeight;
      }

      // X 轴限制
      if (axis === "x" || axis === "both") {
        if (bounds.left !== undefined) {
          constrainedX = Math.max(bounds.left, constrainedX);
        }
        if (bounds.right !== undefined) {
          // 确保元素完全在边界内
          const maxX = bounds.right - elementWidth;
          constrainedX = Math.min(maxX, constrainedX);
        }

        // 边界吸附
        if (snapToBoundary) {
          if (
            bounds.left !== undefined &&
            Math.abs(constrainedX - bounds.left) < snapThreshold
          ) {
            constrainedX = bounds.left;
          }
          if (
            bounds.right !== undefined &&
            Math.abs(constrainedX - (bounds.right - elementWidth)) <
              snapThreshold
          ) {
            constrainedX = bounds.right - elementWidth;
          }
        }
      }

      // Y 轴限制
      if (axis === "y" || axis === "both") {
        if (bounds.top !== undefined) {
          constrainedY = Math.max(bounds.top, constrainedY);
        }
        if (bounds.bottom !== undefined) {
          // 确保元素完全在边界内
          const maxY = bounds.bottom - elementHeight;
          constrainedY = Math.min(maxY, constrainedY);
        }

        // 边界吸附
        if (snapToBoundary) {
          if (
            bounds.top !== undefined &&
            Math.abs(constrainedY - bounds.top) < snapThreshold
          ) {
            constrainedY = bounds.top;
          }
          if (
            bounds.bottom !== undefined &&
            Math.abs(constrainedY - (bounds.bottom - elementHeight)) <
              snapThreshold
          ) {
            constrainedY = bounds.bottom - elementHeight;
          }
        }
      }

      return { x: constrainedX, y: constrainedY };
    },
    [getEffectiveBoundary, axis, snapToBoundary, snapThreshold]
  );

  // 更新位置
  const updatePosition = React.useCallback(
    (newPosition: Position) => {
      const constrainedPosition = constrainPosition(newPosition);
      positionRef.current = constrainedPosition;

      setDragState((prev) => ({
        ...prev,
        currentPosition: constrainedPosition,
      }));

      return constrainedPosition;
    },
    [constrainPosition]
  );

  // 获取鼠标/触摸位置
  const getClientPosition = React.useCallback(
    (event: MouseEvent | TouchEvent): Position => {
      if ("touches" in event) {
        return {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }
      return {
        x: event.clientX,
        y: event.clientY,
      };
    },
    []
  );

  // 处理拖拽移动
  const handleMove = React.useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!dragStateRef.current.isDragging || disabled) return;

      event.preventDefault();

      const clientPos = getClientPosition(event);

      // 计算新的位置：鼠标位置 - 偏移量
      const newPosition = {
        x:
          axis === "y"
            ? dragStateRef.current.currentPosition.x
            : clientPos.x - dragStateRef.current.offset.x,
        y:
          axis === "x"
            ? dragStateRef.current.currentPosition.y
            : clientPos.y - dragStateRef.current.offset.y,
      };

      const constrainedPosition = updatePosition(newPosition);

      onDrag?.(constrainedPosition);
    },
    [disabled, getClientPosition, axis, updatePosition, onDrag]
  );

  // 处理拖拽结束
  const handleEnd = React.useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!dragStateRef.current.isDragging || disabled) return;

      const clientPos = getClientPosition(event);

      // 计算最终位置：鼠标位置 - 偏移量
      const finalPosition = {
        x:
          axis === "y"
            ? dragStateRef.current.currentPosition.x
            : clientPos.x - dragStateRef.current.offset.x,
        y:
          axis === "x"
            ? dragStateRef.current.currentPosition.y
            : clientPos.y - dragStateRef.current.offset.y,
      };

      const constrainedPosition = constrainPosition(finalPosition);

      setDragState((prev) => ({
        ...prev,
        isDragging: false,
        currentPosition: constrainedPosition,
        startPosition: constrainedPosition,
      }));

      // 恢复全局样式
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      onDragEnd?.(constrainedPosition);

      // 移除全局事件监听器
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    },
    [
      disabled,
      getClientPosition,
      axis,
      constrainPosition,
      onDragEnd,
      handleMove,
    ]
  );

  // 处理拖拽开始
  const handleStart = React.useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;

      event.preventDefault();

      // 🎯 在 topLeft 模式下，应用计算的正确初始位置并屏蔽 transform
      if (positionMode === "topLeft" && ref.current) {
        const computedStyle = window.getComputedStyle(ref.current);
        const correctPosition = computeElementPosition(
          ref.current,
          computedStyle
        );

        // 直接应用正确的位置到元素上
        // ref.current.style.position = "fixed";
        ref.current.style.left = `${correctPosition.x}px`;
        ref.current.style.top = `${correctPosition.y}px`;
        ref.current.style.transform = "none";
        ref.current.style.translate = "none";

        // 更新当前位置引用
        positionRef.current = correctPosition;
      }

      const clientPos = getClientPosition(event.nativeEvent);
      const currentPos = positionRef.current;

      const newDragState: DragState = {
        isDragging: true,
        startPosition: currentPos,
        currentPosition: currentPos,
        offset: {
          x: clientPos.x - currentPos.x,
          y: clientPos.y - currentPos.y,
        },
      };
      setDragState(newDragState);

      // 立即更新 ref 以确保拖拽能获取到最新状态
      dragStateRef.current = newDragState;
      positionRef.current = currentPos;

      // 设置全局拖拽样式
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      onDragStart?.(currentPos);

      // 🎯 直接使用事件处理函数，不使用监听模式
      // 添加全局事件监听器
      document.addEventListener("mousemove", handleMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleEnd);
    },
    [
      disabled,
      getClientPosition,
      onDragStart,
      handleMove,
      handleEnd,
      positionMode,
    ]
  );

  // 重置位置
  const reset = React.useCallback(() => {
    const resetPosition = constrainPosition(getInitialPosition());
    setDragState({
      isDragging: false,
      startPosition: resetPosition,
      currentPosition: resetPosition,
      offset: { x: 0, y: 0 },
    });
  }, [getInitialPosition, constrainPosition]);

  // 手动设置位置
  const setPosition = React.useCallback(
    (position: Position) => {
      updatePosition(position);
    },
    [updatePosition]
  );

  // 生成样式
  const transformStyle: React.CSSProperties = React.useMemo(
    () => ({
      transform: `translate(${dragState.currentPosition.x}px, ${dragState.currentPosition.y}px)`,
      willChange: dragState.isDragging ? "transform" : "auto",
      cursor: disabled
        ? "not-allowed"
        : dragState.isDragging
        ? "grabbing"
        : "move",
      userSelect: dragState.isDragging ? "none" : "auto",
      touchAction: "none",
    }),
    [dragState.currentPosition, dragState.isDragging, disabled]
  );

  // 生成 top/left 样式
  const topLeftStyle: React.CSSProperties = React.useMemo(
    () => ({
      position: "fixed" as const,
      left: `${dragState.currentPosition.x}px`,
      top: `${dragState.currentPosition.y}px`,
      willChange: dragState.isDragging ? "left, top" : "auto",
      cursor: disabled
        ? "not-allowed"
        : dragState.isDragging
        ? "grabbing"
        : "move",
      userSelect: dragState.isDragging ? "none" : "auto",
      touchAction: "none",
      // 在 topLeft 模式下屏蔽 transform 和 translate 相关属性
      transform: "none",
      WebkitTransform: "none",
      msTransform: "none",
      translate: "none",
    }),
    [dragState.currentPosition, dragState.isDragging, disabled]
  );

  // 根据定位模式返回对应的样式
  const style: React.CSSProperties = React.useMemo(() => {
    if (positionMode === "topLeft") {
      return topLeftStyle;
    }
    return transformStyle;
  }, [positionMode, transformStyle, topLeftStyle]);

  // 清理函数
  React.useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [handleMove, handleEnd]);

  return {
    ref,
    position: dragState.currentPosition,
    isDragging: dragState.isDragging,
    style,
    topLeftStyle,
    transformStyle,
    reset,
    setPosition,
    onMouseDown: handleStart,
    onTouchStart: handleStart,
  };
}
