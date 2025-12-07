import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * 位置信息接口
 */
export interface Position {
  /** X 坐标 */
  x: number;
  /** Y 坐标 */
  y: number;
}

export interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
}
export type Offset = Rect;
/**
 * useMovable hook 的配置选项
 */
export interface UseMovableOptions<T extends HTMLElement> {
  /** 容器Ref */
  containerRef?: RefObject<T | null>;
  /** 是否禁用拖拽 */
  disabled?: boolean;
  /** 拖拽开始时的回调 */
  onMoveStart?: (position: Position) => void;
  /** 拖拽过程中的回调 */
  onMove?: (position: Position) => void;
  /** 拖拽结束时的回调 */
  onMoveEnd?: (position: Position) => void;
  /** 轴向限制 */
  axis?: "x" | "y" | "both";
  /** 是否吸附到边界 */
  snapToBoundary?: boolean;
  /** 边界吸附距离 */
  snapThreshold?: number;
  /** 是否有偏移，限制边界，比如不是拖到容器或者屏幕边缘，而是在边缘上有偏移10px之类的 */
  offset?: Offset;
}

export function useMove<T extends HTMLElement>(
  options: UseMovableOptions<T> = {}
): {
  moveRef: RefObject<T | null>;
  position: Position;
  isMoving: boolean;
  style: CSSProperties;
  topLeftStyle: CSSProperties;
  reset: () => void;
  onStart: (event: ReactMouseEvent | ReactTouchEvent) => void;
} {
  const {
    containerRef,
    disabled = false,
    onMoveStart,
    onMove,
    onMoveEnd,
    axis = "both",
    snapToBoundary = false,
    snapThreshold = 10,
    offset = {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  } = options;

  // 元素引用
  const moveRef = useRef<T>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);

  // 拖拽状态引用
  const moveStateRef = useRef<{
    isMoving: boolean;
    containerRect: Rect;
    elBaseRect: DOMRect;
    mouseOffset: { x: number; y: number };
    lastPosition: Position;
  }>({
    isMoving: false,
    containerRect: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    elBaseRect: {} as DOMRect,
    mouseOffset: { x: 0, y: 0 },
    lastPosition: { x: 0, y: 0 },
  });

  // 统一获取坐标
  const getCoord = (e: MouseEvent | TouchEvent): Position => {
    if ("touches" in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
  };

  // 开始拖拽：存储当前累计位移和鼠标偏移
  const handleStart = (event: ReactMouseEvent | ReactTouchEvent) => {
    if (moveStateRef.current.isMoving || !moveRef.current || disabled) return;

    const { x: clientX, y: clientY } = getCoord(event.nativeEvent);
    const { elBaseRect } = moveStateRef.current;

    // 计算元素当前真实视口位置（基础位置 + 累计位移）
    const currentElLeft = elBaseRect.left + position.x;
    const currentElTop = elBaseRect.top + position.y;

    // 存储关键值（全程不改变）
    moveStateRef.current.isMoving = true;
    setIsMoving(true);
    moveStateRef.current.mouseOffset = {
      x: clientX - currentElLeft, // 鼠标在元素上的真实偏移
      y: clientY - currentElTop,
    };
    moveStateRef.current.lastPosition = { ...position }; // 记录当前累计位移

    if ("touches" in event.nativeEvent && event.nativeEvent.touches) {
      event.nativeEvent.preventDefault();
    }

    setIsMoving(true);
    onMoveStart?.(position);
  };

  // 拖拽移动：基于累计位移计算，不重置任何状态
  const handleMove = (event: MouseEvent | TouchEvent) => {
    if (!moveStateRef.current.isMoving || disabled) return;

    const { mouseOffset, containerRect, elBaseRect } = moveStateRef.current;
    const { x: clientX, y: clientY } = getCoord(event);
    const { width: elWidth, height: elHeight } = elBaseRect;
    // 1. 计算元素期望的真实视口位置
    let desiredElLeft = clientX - mouseOffset.x;
    let desiredElTop = clientY - mouseOffset.y;

    // 2. 边界限制
    let {
      left: containerLeft,
      right: containerRight,
      top: containerTop,
      bottom: containerBottom,
    } = containerRect;

    // 应用offset
    if (offset) {
      containerLeft += offset.left;
      containerTop += offset.top;
      containerRight -= offset.right;
      containerBottom -= offset.bottom;
    }

    const elRight = desiredElLeft + elWidth;
    const elBottom = desiredElTop + elHeight;

    // 使用用户提供的边界判断逻辑
    if (axis !== "y") {
      if (desiredElLeft - containerLeft <= 0) desiredElLeft = containerLeft;
      if (elRight - containerRight >= 0)
        desiredElLeft = containerRight - elWidth;

      // 吸附到边界
      if (snapToBoundary) {
        if (Math.abs(desiredElLeft - containerLeft) < snapThreshold) {
          desiredElLeft = containerLeft;
        } else if (
          Math.abs(containerRight - elWidth - desiredElLeft) < snapThreshold
        ) {
          desiredElLeft = containerRight - elWidth;
        }
      }
    }

    if (axis !== "x") {
      if (desiredElTop - containerTop <= 0) desiredElTop = containerTop;
      if (elBottom - containerBottom >= 0)
        desiredElTop = containerBottom - elHeight;

      // 吸附到边界
      if (snapToBoundary) {
        if (Math.abs(desiredElTop - containerTop) < snapThreshold) {
          desiredElTop = containerTop;
        } else if (
          Math.abs(containerBottom - elHeight - desiredElTop) < snapThreshold
        ) {
          desiredElTop = containerBottom - elHeight;
        }
      }
    }

    // 3. 计算新的累计位移（期望位置 - 基础位置）
    const newTranslateX = desiredElLeft - elBaseRect.left;
    const newTranslateY = desiredElTop - elBaseRect.top;

    // 4. 更新累计位移（全程不重置，只修正）
    setPosition({ x: newTranslateX, y: newTranslateY });
    onMove?.({ x: newTranslateX, y: newTranslateY });
  };

  // 结束拖拽：只改变拖拽状态，不重置任何位置
  const handleEnd = () => {
    moveStateRef.current.isMoving = false;
    setIsMoving(false);
    onMoveEnd?.(position);
  };

  // 初始化（只跑一次，存储基础位置）
  useEffect(() => {
    if (!moveRef.current) return;

    const el = moveRef.current;

    moveStateRef.current.elBaseRect = el.getBoundingClientRect();
    moveStateRef.current.containerRect = containerRef?.current
      ? containerRef?.current?.getBoundingClientRect()
      : {
          left: 0,
          top: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
        };

    // 绑定全局事件
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
    document.addEventListener("touchcancel", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
    };
  }, [containerRef, disabled]);

  // 最终样式：基础变换 + 累计位移（全程不重置）
  const style: CSSProperties = useMemo(() => {
    const transform = `translate(${position.x}px, ${position.y}px)`;
    return {
      transform: transform,
      cursor: disabled ? "default" : isMoving ? "grabbing" : "grab",
      userSelect: "none",
    };
  }, [position, isMoving, disabled]);

  const topLeftStyle: CSSProperties = useMemo(() => {
    return {
      left: `${position.x}px`,
      top: `${position.y}px`,
      cursor: disabled ? "default" : isMoving ? "grabbing" : "grab",
      userSelect: "none",
    };
  }, [position, isMoving, disabled]);

  // 重置位置
  const reset = () => {
    setPosition({ x: 0, y: 0 });
    onMoveEnd?.({ x: 0, y: 0 });
  };

  return {
    moveRef,
    position,
    isMoving,
    style,
    topLeftStyle,
    reset,
    onStart: handleStart,
  };
}
