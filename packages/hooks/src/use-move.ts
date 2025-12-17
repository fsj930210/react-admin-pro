import { type RefObject, useEffect, useRef, useState } from "react";

export interface Position {
  x: number;
  y: number;
}

export interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export type Offset = Pick<Rect, "top" | "left" | "right" | "bottom">;

export interface UseMovableOptions<
  T extends HTMLElement,
  C extends HTMLElement = T
> {
  disabled?: boolean;
  axis?: "x" | "y" | "both";
  onMoveStart?: (event: MouseEvent | TouchEvent) => void;
  onMove?: (event: MouseEvent | TouchEvent, position: Position) => void;
  onMoveEnd?: (event: MouseEvent | TouchEvent) => void;
  useTopLeft?: boolean;
  containerRef?: RefObject<C | null>;
  snapToBoundary?: boolean;
  snapThreshold?: number;
  offset?: Offset;
  boundary?: boolean;
}

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

export function useMove<T extends HTMLElement, C extends HTMLElement = T>(
  options: UseMovableOptions<T, C>
) {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const moveRef = useRef<T>(null);
  const [position, _setPosition] = useState<Position | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const lastestPostionRef = useRef<Position | null>(position);

  const setPosition = (value: Position | null) => {
    lastestPostionRef.current = value;
    _setPosition(value);
  };

  const moveStateRef = useRef({
    isMoving: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    elRect: {} as Rect,
    containerRect: {} as Rect,
  });

  const rafIdRef = useRef<number | null>(null);
  const cancelRaf = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  const computeBoundary = (): Rect => {
    let baseRect: Rect;
    const {
      containerRef,
      useTopLeft = false,
      offset = { left: 0, right: 0, top: 0, bottom: 0 },
    } = optionsRef.current;
    if (containerRef?.current) {
      const container = containerRef.current;
      const cr = container.getBoundingClientRect();
      baseRect = {
        top: cr.top,
        left: cr.left,
        right: cr.right,
        bottom: cr.bottom,
        width: useTopLeft ? cr.width : container.clientWidth,
        height: useTopLeft ? cr.height : container.clientHeight,
      };
    } else {
      baseRect = {
        top: 0,
        left: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }

    return {
      top: baseRect.top + offset.top,
      left: baseRect.left + offset.left,
      right: baseRect.right - offset.right,
      bottom: baseRect.bottom - offset.bottom,
      width: baseRect.width,
      height: baseRect.height,
    };
  };

  const calculateSnapPosition = (currentPos: Position | null) => {
    const el = moveRef.current;
    const { boundary = true, snapThreshold = 10 } = optionsRef.current;
    if (!boundary || !el) return currentPos;
    const { elRect, containerRect } = moveStateRef.current;
    const { width: elWidth, height: elHeight } = elRect;
    const { width: containerWidth, height: containerHeight } = containerRect;
    let targetX = currentPos?.x || 0;
    let targetY = currentPos?.y || 0; 

    if (Math.abs(targetX) <= snapThreshold) targetX = 0;
    else if (Math.abs(targetX - (containerWidth - elWidth)) <= snapThreshold) {
      targetX = containerWidth - elWidth;
    }

    if (Math.abs(targetY) <= snapThreshold) targetY = 0;
    else if (
      Math.abs(targetY - (containerHeight - elHeight)) <= snapThreshold
    ) {
      targetY = containerHeight - elHeight;
    }

    return { x: targetX, y: targetY };
  };

  const calculateTranslatePosition = (clientX: number, clientY: number) => {
    const el = moveRef.current;
    if (!el) return lastestPostionRef.current;
    const { axis = "both", boundary = true } = optionsRef.current;
    const { startX, startY, elRect, containerRect, lastX, lastY } =
      moveStateRef.current;
    const { width: elWidth, height: elHeight, top: elTop, left: elLeft, right: elRight, bottom: elBottom} = elRect;
    const { top: containerTop, left: containerLeft, right: containerRight, bottom:containerBottom } = containerRect;
    const dx = clientX - startX;
    const dy = clientY - startY;
    let targetX = lastX;
    let targetY = lastY;
    if (axis !== "y") {
      targetX = lastX + dx;
    }
    if (axis !== "x") {
      targetY = lastY + dy;
    }
    if (boundary) {
      const finalElLeft = elLeft + dx;
      const finalElTop = elTop + dy;
      const finalElRight = finalElLeft + elWidth;
      const finalElBottom = finalElTop + elHeight;
      if (axis !== 'y') {
        if (finalElLeft < containerLeft) {
          targetX = lastX + (containerLeft- elLeft);
        }
        if (finalElRight > containerRight) {
          targetX = lastX + (containerRight - elRight);
        }
      }
      if (axis !== 'x') {
        if (finalElTop < containerTop) {
          targetY = lastY + (containerTop - elTop);
        }
 
        if (finalElBottom > containerBottom) {
          targetY = lastY + (containerBottom - elBottom);
        }
      }

    }
    return { x: targetX, y: targetY };
  };

  const calculateTopLeftPosition = (clientX: number, clientY: number) => {
    const el = moveRef.current;
    const { axis = "both", boundary = true } = optionsRef.current;
    if (!el) return lastestPostionRef.current;
    const { startX, startY, elRect, containerRect, lastX, lastY } =
      moveStateRef.current;
    const {
      width: elWidth,
      height: elHeight,
      left: elLeft,
      top: elTop,
    } = elRect;
    const {
      left: containerLeft,
      right: containerRight,
      top: containerTop,
      bottom: containerBottom,
    } = containerRect;
    const dx = clientX - startX;
    const dy = clientY - startY;
    let targetX = lastX;
    let targetY = lastY;
    if (axis !== "y") {
      targetX = elLeft + dx;
    }
    if (axis !== "x") {
      targetY = elTop + dy;
    }
    if (boundary) {
      if (axis !== "y") {
        if (targetX < containerLeft) targetX = containerLeft;
        if (targetX + elWidth > containerRight)
          targetX = containerRight - elWidth;
      }
      if (axis !== "x") {
        if (targetY < containerTop) targetY = containerTop;
        if (targetY + elHeight > containerBottom)
          targetY = containerBottom - elHeight;
      }
    }
    return { x: targetX - containerLeft, y: targetY - containerTop };
  };

  const handleTranslateStart = (e: MouseEvent | TouchEvent) => {
    console.log(moveRef)
    if (!moveRef.current) return;
    const elDOMRect = moveRef.current.getBoundingClientRect();
    const elRect: Rect = {
      top: elDOMRect.top,
      left: elDOMRect.left,
      right: elDOMRect.right,
      bottom: elDOMRect.bottom,
      width: elDOMRect.width,
      height: elDOMRect.height,
    };
    handleCommonStart(e, elRect)
  };

  const handleTopLeftStart = (e: MouseEvent | TouchEvent) => {
    if (!moveRef.current) return;
    const containerRect = computeBoundary();
    const { offsetWidth, offsetHeight } = moveRef.current;
    const computedStyle = window.getComputedStyle(moveRef.current);
    const styleLeft = parseInt(computedStyle.left || "0", 10);
    const styleTop = parseInt(computedStyle.top || "0", 10);
    const elLeft = styleLeft + containerRect.left;
    const elTop = styleTop + containerRect.top;
    const elRight = offsetWidth + elLeft;
    const elBottom = offsetHeight + elTop;
    const elRect: Rect = {
      top: elTop,
      left: elLeft,
      right: elRight,
      bottom: elBottom,
      width: offsetWidth,
      height: offsetHeight,
    };
    handleCommonStart(e, elRect);

  };

  const handleCommonStart = (
    e: MouseEvent | TouchEvent,
    elRect: Rect
  ) => {
    const { clientX, clientY } = getClientCoord(e);
    const current = lastestPostionRef.current;
    moveStateRef.current = {
      isMoving: true,
      startX: clientX,
      startY: clientY,
      lastX: (current?.x || 0),
      lastY: (current?.y || 0),
      elRect,
      containerRect: computeBoundary(),
    };
    setIsMoving(true);
    optionsRef.current.onMoveStart?.(e);
  }

  const handleStart = (e: MouseEvent | TouchEvent) => {
    console.log(e)
    if (e.cancelable) e.preventDefault();
    const { disabled = false, useTopLeft = false } = optionsRef.current;
    if (disabled) return;
    if (useTopLeft) handleTopLeftStart(e);
    else handleTranslateStart(e);
  };

  const handleCommonMove = (
    e: MouseEvent | TouchEvent,
    calcPostion: (clientX: number, clientY: number) => Position | null
  ) => {
    if (!moveStateRef.current.isMoving) return;
    const { clientX, clientY } = getClientCoord(e);
    const current = lastestPostionRef.current;
    const position = calcPostion(clientX, clientY);
    if (position) {
      const {x, y} = position
    if (Math.abs(x - (current?.x || 0)) > 1 || Math.abs(y - (current?.y || 0)) > 1) {
      setPosition({ x, y });
      optionsRef.current.onMove?.(e, { x, y });
    }
    }

  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    const { disabled = false, useTopLeft = false } = optionsRef.current;
    if (disabled) return;

    cancelRaf();
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      // 再次检查（防卸载后执行）
      if (disabled) return;
      handleCommonMove(
        e,
        useTopLeft ? calculateTopLeftPosition : calculateTranslatePosition
      );
    });
  };

  const handleEnd = (e: MouseEvent | TouchEvent) => {
    if (!moveStateRef.current.isMoving) return;
    const { snapToBoundary = true } = optionsRef.current;
    if (snapToBoundary) {
      setPosition(calculateSnapPosition(lastestPostionRef.current));
    }
    moveStateRef.current.isMoving = false;
    setIsMoving(false);

    optionsRef.current.onMoveEnd?.(e);
  };


  useEffect(() => {
    console.log(moveRef.current)
    const el = moveRef.current;
    if (!el) return;
    el.addEventListener("mousedown", handleStart);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    el.addEventListener("touchstart", handleStart, { passive: false });
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
    document.addEventListener("touchcancel", handleEnd);

    return () => {
      cancelRaf();
      el.removeEventListener("mousedown", handleStart);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      el.removeEventListener("touchstart", handleStart);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
    };
  }, []);

  return {
    moveRef,
    position,
    isMoving,
  };
}
