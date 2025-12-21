import { useEffect, useRef, useState } from "react";

export type ResizeDirection = "n" | "s" | "w" | "e" | "nw" | "ne" | "sw" | "se";

export const Direction = {
  N: "n" as const,
  S: "s" as const,
  W: "w" as const,
  E: "e" as const,
  NW: "nw" as const,
  NE: "ne" as const,
  SW: "sw" as const,
  SE: "se" as const,
};

type Size = {
  width: number;
  height: number;
};

type Position = {
  x: number;
  y: number;
};

export interface ResizeOptions {
  minSize?: Partial<Size>;
  maxSize?: Partial<Size>;
  directions?: ResizeDirection[];
  onResize?: (size: Size, position: Position) => void;
  onResizeStart?: (direction: ResizeDirection) => void;
  onResizeEnd?: () => void;
  positionMode?: "translate" | "topLeft";
  disabled?: boolean;
  enableEdgeResize?: boolean;
  edgeSize?: number;
}

// 统一的客户端坐标获取函数
const getClientCoord = (
  e: MouseEvent | TouchEvent
): { clientX: number; clientY: number } => {
  if (e instanceof MouseEvent) {
    return { clientX: e.clientX, clientY: e.clientY };
  }
  const touch = e.touches[0] || e.changedTouches[0];
  return touch
    ? { clientX: touch.clientX, clientY: touch.clientY }
    : { clientX: 0, clientY: 0 };
};

// 检查方向是否允许
const isDirectionAllowed = (
  direction: ResizeDirection,
  allowedDirections?: ResizeDirection[]
): boolean => {
  if (!allowedDirections) return true;
  return allowedDirections.includes(direction);
};

// 获取对应的cursor样式
const getCursor = (direction: ResizeDirection | null): string => {
  switch (direction) {
    case "n":
      return "n-resize";
    case "s":
      return "s-resize";
    case "w":
      return "w-resize";
    case "e":
      return "e-resize";
    case "nw":
      return "nw-resize";
    case "ne":
      return "ne-resize";
    case "sw":
      return "sw-resize";
    case "se":
      return "se-resize";
    default:
      return "default";
  }
};

// 检测鼠标位置确定resize方向
const getResizeDirection = (
  x: number,
  y: number,
  rect: DOMRect,
  edgeSize: number,
  allowedDirections?: ResizeDirection[]
): ResizeDirection | null => {
  const { left, top, right, bottom } = rect;
  const isNearLeft = x - left < edgeSize;
  const isNearRight = right - x < edgeSize;
  const isNearTop = y - top < edgeSize;
  const isNearBottom = bottom - y < edgeSize;

  // 角落区域优先
  if (isNearTop && isNearLeft && isDirectionAllowed("nw", allowedDirections))
    return "nw";
  if (isNearTop && isNearRight && isDirectionAllowed("ne", allowedDirections))
    return "ne";
  if (isNearBottom && isNearLeft && isDirectionAllowed("sw", allowedDirections))
    return "sw";
  if (
    isNearBottom &&
    isNearRight &&
    isDirectionAllowed("se", allowedDirections)
  )
    return "se";

  // 边缘区域
  if (isNearTop && isDirectionAllowed("n", allowedDirections)) return "n";
  if (isNearBottom && isDirectionAllowed("s", allowedDirections)) return "s";
  if (isNearLeft && isDirectionAllowed("w", allowedDirections)) return "w";
  if (isNearRight && isDirectionAllowed("e", allowedDirections)) return "e";

  return null;
};

// 计算resize后的新尺寸和位置，考虑边界限制
const calculateResizeWithBoundary = (
  direction: ResizeDirection,
  dx: number,
  dy: number,
  startSize: Size,
  startPosition: Position,
  minSize: Partial<Size>,
  maxSize: Partial<Size>
): { size: Size; position: Position } => {
  const minWidth = minSize.width ?? 50;
  const minHeight = minSize.height ?? 50;
  const maxWidth = maxSize.width ?? Infinity;
  const maxHeight = maxSize.height ?? Infinity;

  let newWidth = startSize.width;
  let newHeight = startSize.height;
  let newX = startPosition.x;
  let newY = startPosition.y;

  // 根据方向计算新的尺寸和位置
  switch (direction) {
    case "e":
      newWidth = startSize.width + dx;
      break;
    case "w":
      newWidth = startSize.width - dx;
      newX = startPosition.x + dx;
      break;
    case "n":
      newHeight = startSize.height - dy;
      newY = startPosition.y + dy;
      break;
    case "s":
      newHeight = startSize.height + dy;
      break;
    case "nw":
      newWidth = startSize.width - dx;
      newHeight = startSize.height - dy;
      newX = startPosition.x + dx;
      newY = startPosition.y + dy;
      break;
    case "ne":
      newWidth = startSize.width + dx;
      newHeight = startSize.height - dy;
      newY = startPosition.y + dy;
      break;
    case "sw":
      newWidth = startSize.width - dx;
      newHeight = startSize.height + dy;
      newX = startPosition.x + dx;
      break;
    case "se":
      newWidth = startSize.width + dx;
      newHeight = startSize.height + dy;
      break;
  }

  // 应用边界限制
  let finalWidth = newWidth;
  let finalHeight = newHeight;
  let finalX = newX;
  let finalY = newY;

  // 宽度边界处理
  if (newWidth < minWidth) {
    finalWidth = minWidth;
    if (direction.includes("w")) {
      finalX = startPosition.x + (startSize.width - minWidth);
    }
  } else if (newWidth > maxWidth) {
    finalWidth = maxWidth;
    if (direction.includes("w")) {
      finalX = startPosition.x + (startSize.width - maxWidth);
    } else if (direction.includes("e")) {
      // 向右拖动达到最大宽度时，保持位置不变
      finalX = startPosition.x;
    }
  }

  // 高度边界处理
  if (newHeight < minHeight) {
    finalHeight = minHeight;
    if (direction.includes("n")) {
      finalY = startPosition.y + (startSize.height - minHeight);
    }
  } else if (newHeight > maxHeight) {
    finalHeight = maxHeight;
    if (direction.includes("n")) {
      finalY = startPosition.y + (startSize.height - maxHeight);
    } else if (direction.includes("s")) {
      // 向下拖动达到最大高度时，保持位置不变
      finalY = startPosition.y;
    }
  }

  return {
    size: { width: finalWidth, height: finalHeight },
    position: { x: finalX, y: finalY },
  };
};

function useResize<T extends HTMLElement>(options?: ResizeOptions) {
  const optionsRef = useRef<ResizeOptions>({});
  optionsRef.current = options || {};

  const resizeRef = useRef<T>(null);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [size, setSize] = useState<Size | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [cursor, setCursor] = useState<string>("default");

  const resizeStateRef = useRef({
    isResizing: false,
    startX: 0,
    startY: 0,
    startSize: { width: 0, height: 0 } as Size,
    startPosition: { x: 0, y: 0 } as Position,
    direction: undefined as ResizeDirection | undefined,
  });

  const rafIdRef = useRef<number | null>(null);
  const latestPositionRef = useRef<Position | null>(position);
  const latestSizeRef = useRef<Size | null>(size);

  const cancelRaf = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  // 统一的resize开始处理
  const handleResizeStart = (
    e: MouseEvent | TouchEvent,
    direction?: ResizeDirection
  ) => {
    if (!resizeRef.current) return;

    const {
      disabled,
      directions,
      enableEdgeResize,
      edgeSize = 8,
      onResizeStart,
    } = optionsRef.current;
    if (disabled) return;

    let resizeDirection = direction || null;

    // 如果没有指定方向，则从鼠标位置检测方向（边缘resize）
    if (!resizeDirection && enableEdgeResize) {
      const rect = resizeRef.current.getBoundingClientRect();
      const coord = getClientCoord(e);
      resizeDirection = getResizeDirection(
        coord.clientX,
        coord.clientY,
        rect,
        edgeSize,
        directions
      );
    }

    if (!resizeDirection || !isDirectionAllowed(resizeDirection, directions))
      return;

    const rect = resizeRef.current.getBoundingClientRect();
    const currentSize = { width: rect.width, height: rect.height };
    const currentPosition = latestPositionRef.current || { x: 0, y: 0 };

    const coord = getClientCoord(e);

    resizeStateRef.current = {
      isResizing: true,
      startX: coord.clientX,
      startY: coord.clientY,
      startSize: currentSize,
      startPosition: currentPosition,
      direction: resizeDirection || undefined,
    };

    setIsResizing(true);
    onResizeStart?.(resizeDirection);
  };

  // 统一的移动处理
  const handleResizeMove = (e: MouseEvent | TouchEvent) => {
    // 边缘resize时的cursor更新
    if (!resizeStateRef.current.isResizing) {
      const {
        enableEdgeResize = false,
        edgeSize = 8,
        directions,
      } = optionsRef.current;
      if (enableEdgeResize && resizeRef.current) {
        const rect = resizeRef.current.getBoundingClientRect();
        const coord = getClientCoord(e);
        const direction = getResizeDirection(
          coord.clientX,
          coord.clientY,
          rect,
          edgeSize,
          directions
        );
        const newCursor = getCursor(direction);
        if (cursor !== newCursor) {
          setCursor(newCursor);
        }
      }
      return;
    }

    if (!resizeStateRef.current.isResizing) return;

    cancelRaf();
    rafIdRef.current = requestAnimationFrame(() => {
      const { direction, startX, startY, startSize, startPosition } =
        resizeStateRef.current;
      if (!direction) return;

      const coord = getClientCoord(e);
      const dx = coord.clientX - startX;
      const dy = coord.clientY - startY;

      const { maxSize, minSize, onResize } = optionsRef.current;

      // 计算新的尺寸和位置，考虑边界限制
      const result = calculateResizeWithBoundary(
        direction,
        dx,
        dy,
        startSize,
        startPosition,
        minSize || {},
        maxSize || {}
      );

      latestSizeRef.current = result.size;
      latestPositionRef.current = result.position;
      setSize(result.size);
      setPosition(result.position);

      // 如果提供了回调，则执行回调
      if (onResize) {
        onResize(result.size, result.position);
      }
    });
  };

  // 统一的结束处理
  const handleResizeEnd = () => {
    if (!resizeStateRef.current.isResizing) return;

    cancelRaf();

    resizeStateRef.current = {
      isResizing: false,
      startX: 0,
      startY: 0,
      startSize: { width: 0, height: 0 } as Size,
      startPosition: { x: 0, y: 0 } as Position,
      direction: undefined,
    };

    setIsResizing(false);
    optionsRef.current.onResizeEnd?.();
  };

  // 手动触发resize的处理函数
  const handleResize = (direction: ResizeDirection) => {
    return (e: React.MouseEvent | React.TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      handleResizeStart(e.nativeEvent as MouseEvent | TouchEvent, direction);
    };
  };

  // 统一的事件绑定
  const bindEvent = () => {
    const el = resizeRef.current;
    if (!el) return;

    // 鼠标按下事件（用于边缘resize）
    el.addEventListener("mousedown", handleResizeStart);

    // 全局移动和结束事件
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);

    // 移动端支持
    el.addEventListener("touchstart", handleResizeStart, { passive: false });
    document.addEventListener("touchmove", handleResizeMove, {
      passive: false,
    });
    document.addEventListener("touchend", handleResizeEnd);
    document.addEventListener("touchcancel", handleResizeEnd);
  };

  // 统一的事件解绑
  const removeEvent = () => {
    const el = resizeRef.current;
    if (!el) return;

    cancelRaf();

    el.removeEventListener("mousedown", handleResizeStart);
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
    el.removeEventListener("touchstart", handleResizeStart);
    document.removeEventListener("touchmove", handleResizeMove);
    document.removeEventListener("touchend", handleResizeEnd);
    document.removeEventListener("touchcancel", handleResizeEnd);
  };

  useEffect(() => {
    bindEvent();
    return removeEvent;
  }, []);

  return {
    resizeRef,
    handleResize,
    isResizing,
    size,
    position,
    cursor,
    bindEvent,
    removeEvent,
  };
}

export { useResize };
