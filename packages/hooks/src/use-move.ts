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
  // const [translate, _setTranslate] = useState({ x: 0, y: 0 });
  // const [topLeft, _setTopLeft] = useState({ left: 0, top: 0 });
  const [position, _setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const lastestPostionRef = useRef(position);
  // const latestTranslateRef = useRef(translate);
  // const latestTopLeftRef = useRef(topLeft);

  // const setTranslate = (value: { x: number; y: number }) => {
  //   latestTranslateRef.current = value;
  //   _setTranslate(value);
  // };

  // const setTopLeft = (value: { left: number; top: number }) => {
  //   latestTopLeftRef.current = value;
  //   _setTopLeft(value);
  // };
  const setPosition = (value: Position) => {
    lastestPostionRef.current = value;
    _setPosition(value);
  };
  // // 拖拽状态
  // const translateStateRef = useRef({
  //   isMoving: false,
  //   startX: 0,
  //   startY: 0,
  //   lastX: 0,
  //   lastY: 0,
  //   elRect: {} as Rect,
  //   containerRect: {} as Rect,
  // });

  // const topLeftStateRef = useRef({
  //   isMoving: false,
  //   startX: 0,
  //   startY: 0,
  //   elRect: {} as Rect,
  //   containerRect: {} as Rect,
  // });

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
  const calculateSnapPosition = (currentPos: Position) => {
    const el = moveRef.current;
    const { boundary = true, snapThreshold = 10 } = optionsRef.current;
    if (!boundary || !el) return currentPos;
    const { elRect, containerRect } = moveStateRef.current;
    const { width: elWidth, height: elHeight } = elRect;
    const { width: containerWidth, height: containerHeight } = containerRect;
    let targetX = currentPos.x;
    let targetY = currentPos.y;

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
  const handleCommonMove = (
    e: MouseEvent | TouchEvent,
    calcPostion: (clientX: number, clientY: number) => Position
  ) => {
    if (!moveStateRef.current.isMoving) return;
    const { clientX, clientY } = getClientCoord(e);
    const current = lastestPostionRef.current;
    const { x, y } = calcPostion(clientX, clientY);
    if (Math.abs(x - current.x) > 1 || Math.abs(y - current.y) > 1) {
      setPosition({ x, y });
      optionsRef.current.onMove?.(e, { x, y });
    }
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
  // ====== Translate 模式逻辑 ======

  const calculateTranslatePosition = (clientX: number, clientY: number) => {
    const el = moveRef.current;
    if (!el) return lastestPostionRef.current;
    const { axis = "both", boundary = true } = optionsRef.current;
    const { startX, startY, elRect, containerRect, lastX, lastY } =
      moveStateRef.current;
    const { width: elWidth, height: elHeight } = elRect;
    const { width: containerWidth, height: containerHeight } = containerRect;
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
      if (axis !== "y") {
        targetX = Math.max(0, Math.min(targetX, containerWidth - elWidth));
      }
      if (axis !== "x") {
        targetY = Math.max(0, Math.min(targetY, containerHeight - elHeight));
      }
    }
    return { x: targetX, y: targetY };
  };

  const handleTranslateStart = (e: MouseEvent | TouchEvent) => {
    if (!moveRef.current) return;

    const { clientX, clientY } = getClientCoord(e);
    const current = lastestPostionRef.current;
    const elDOMRect = moveRef.current.getBoundingClientRect();
    const elRect: Rect = {
      top: elDOMRect.top,
      left: elDOMRect.left,
      right: elDOMRect.right,
      bottom: elDOMRect.bottom,
      width: elDOMRect.width,
      height: elDOMRect.height,
    };
    moveStateRef.current = {
      isMoving: true,
      startX: clientX,
      startY: clientY,
      lastX: current.x,
      lastY: current.y,
      elRect,
      containerRect: computeBoundary(),
    };
    setIsMoving(true);
    optionsRef.current.onMoveStart?.(e);
  };

  // ====== TopLeft 模式逻辑 ======
  const handleTopLeftStart = (e: MouseEvent | TouchEvent) => {
    if (!moveRef.current) return;

    const { clientX, clientY } = getClientCoord(e);
    const containerRect = computeBoundary();
    const current = lastestPostionRef.current;
    const { offsetWidth, offsetHeight, style } = moveRef.current;
    const elLeft = parseInt(style.left || "0", 10) + containerRect.left;
    const elTop = parseInt(style.top || "0", 10) + containerRect.top;
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

    moveStateRef.current = {
      isMoving: true,
      startX: clientX,
      startY: clientY,
      elRect: elRect,
      lastX: current.x,
      lastY: current.y,
      containerRect,
    };
    setIsMoving(true);
    optionsRef.current.onMoveStart?.(e);
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

  // const calculateTopLeftSnapPosition = (currentPos: Position) => {
  //   const el = moveRef.current;
  //   const { boundary = true, snapThreshold = 10 } = optionsRef.current;
  //   if (!boundary || !el) return currentPos;
  //   const { elRect, containerRect } = moveStateRef.current;
  //   const { width: elWidth, height: elHeight } = elRect;
  //   const {
  //     width: containerWidth,
  //     height: containerHeight,
  //     left: containerLeft,
  //     right: containerRight,
  //     top: containerTop,
  //     bottom: containerBottom,
  //   } = containerRect;
  //   let targetX = currentPos.x;
  //   let targetY = currentPos.y;

  //   // if (targetX <= snapThreshold) targetX = 0;
  //   // else if (Math.abs(containerWidth - (targetX + elWidth)) <= snapThreshold) {
  //   //   targetX = containerWidth - elWidth;
  //   // }

  //   // if (Math.abs(targetY - containerTop) <= snapThreshold)
  //   //   targetY = containerTop;
  //   // else if (
  //   //   Math.abs(targetY - (containerBottom - elHeight)) <= snapThreshold
  //   // ) {
  //   //   targetY = containerBottom - elHeight;
  //   // }
  //   if (Math.abs(targetX) <= snapThreshold) targetX = 0;
  //   else if (Math.abs(targetX - (containerWidth - elWidth)) <= snapThreshold) {
  //     targetX = containerWidth - elWidth;
  //   }

  //   if (Math.abs(targetY) <= snapThreshold) targetY = 0;
  //   else if (
  //     Math.abs(targetY - (containerHeight - elHeight)) <= snapThreshold
  //   ) {
  //     targetY = containerHeight - elHeight;
  //   }
  //   return { x: targetX, y: targetY };
  // };
  // const handleTopLeftMove = (e: MouseEvent | TouchEvent) => {
  //   // if (!moveStateRef.current.isMoving) return;
  //   // const { clientX, clientY } = getClientCoord(e);
  //   // const { startX, startY, elRect, containerRect } = topLeftStateRef.current;
  //   // const { width, height, left, top } = elRect;

  //   // let newLeft = left + (clientX - startX);
  //   // let newTop = top + (clientY - startY);

  //   // const { left: cL, right: cR, top: cT, bottom: cB } = containerRect;

  //   // // X 轴
  //   // if (axis !== "y") {
  //   //   if (newLeft < cL) newLeft = cL;
  //   //   if (newLeft + width > cR) newLeft = cR - width;
  //   //   if (snapToBoundary) {
  //   //     if (Math.abs(newLeft - cL) <= snapThreshold) newLeft = cL;
  //   //     else if (Math.abs(newLeft - (cR - width)) <= snapThreshold)
  //   //       newLeft = cR - width;
  //   //   }
  //   // }

  //   // // Y 轴
  //   // if (axis !== "x") {
  //   //   if (newTop < cT) newTop = cT;
  //   //   if (newTop + height > cB) newTop = cB - height;
  //   //   if (snapToBoundary) {
  //   //     if (Math.abs(newTop - cT) <= snapThreshold) newTop = cT;
  //   //     else if (Math.abs(newTop - (cB - height)) <= snapThreshold)
  //   //       newTop = cB - height;
  //   //   }
  //   // }

  //   // const relLeft = newLeft - containerRect.left;
  //   // const relTop = newTop - containerRect.top;
  //   // const newTopLeft = { left: relLeft, top: relTop };
  //   // const current = latestTopLeftRef.current;
  //   // if (
  //   //   Math.abs(newTopLeft.left - current.left) > 1 ||
  //   //   Math.abs(newTopLeft.top - current.top) > 1
  //   // ) {
  //   //   setTopLeft(newTopLeft);
  //   //   onMove?.(e, { x: relLeft, y: relTop });
  //   // }
  //   if (!moveStateRef.current.isMoving) return;
  //   const { clientX, clientY } = getClientCoord(e);
  //   const current = lastestPostionRef.current;
  //   const { x, y } = calculateTopLeftPosition(clientX, clientY);
  //   if (Math.abs(x - current.x) > 1 || Math.abs(y - current.y) > 1) {
  //     setPosition({ x, y });
  //     optionsRef.current.onMove?.(e, { x, y });
  //   }
  // };

  // const handleTopLeftEnd = (e: MouseEvent | TouchEvent) => {
  //   if (!moveStateRef.current.isMoving) return;
  //   const { snapToBoundary = true } = optionsRef.current;
  //   if (snapToBoundary) {
  //     setPosition(calculateTopLeftSnapPosition(lastestPostionRef.current));
  //   }
  //   moveStateRef.current.isMoving = false;
  //   setIsMoving(false);
  //   optionsRef.current.onMoveEnd?.(e);
  // };

  const handleStart = (e: MouseEvent | TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    const { disabled = false, useTopLeft = false } = optionsRef.current;
    if (disabled) return;
    if (useTopLeft) handleTopLeftStart(e);
    else handleTranslateStart(e);
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
      // if (useTopLeft) handleCommonMove(e, calculateTopLeftPosition);
      // else handleTranslateMove(e, calculateTranslatePosition);
    });
  };

  // const handleEnd = (e: MouseEvent | TouchEvent) => {
  //   if (e.cancelable) e.preventDefault();
  //   const { useTopLeft = false } = optionsRef.current;
  //   cancelRaf();
  //   if (useTopLeft) handleTopLeftEnd(e);
  //   else handleTranslateEnd(e);
  // };

  useEffect(() => {
    const el = moveRef.current;
    if (!el) return;

    // 鼠标事件
    el.addEventListener("mousedown", handleStart);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);

    // 触摸事件（非 passive）
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
