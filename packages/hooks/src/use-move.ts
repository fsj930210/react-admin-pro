import { type RefObject, useEffect, useRef, useState } from 'react';

// ====== 类型定义 ======
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

export type Offset = Pick<Rect, 'top' | 'left' | 'right' | 'bottom'>;

interface CommonOptions {
  disabled?: boolean;
  axis?: 'x' | 'y' | 'both';
  onMoveStart?: (event: MouseEvent | TouchEvent) => void;
  onMove?: (event: MouseEvent | TouchEvent, position: Position) => void;
  onMoveEnd?: (event: MouseEvent | TouchEvent) => void;
}

interface TopLeftOptions<C extends HTMLElement> {
  containerRef?: RefObject<C | null>;
  snapToBoundary?: boolean;
  snapThreshold?: number;
  offset?: Offset;
}

interface TranslateOptions {
  // 预留
}

export interface UseMovableOptions<T extends HTMLElement, C extends HTMLElement = T>
  extends CommonOptions {
  mode?: 'translate' | 'topLeft';
  topLeft?: TopLeftOptions<C>;
  translate?: TranslateOptions;
}

// ====== 工具函数 ======
const getClientCoord = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
  if ('touches' in e && e.touches.length > 0) {
    const touch = e.touches[0];
    return { x: touch.clientX, y: touch.clientY };
  }
  return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
};

// ====== 主 Hook ======
export function useMove<T extends HTMLElement, C extends HTMLElement = T>(
  options: UseMovableOptions<T, C>
) {
  // ✅ 实时同步 options（无 useEffect！）
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // refs & state
  const moveRef = useRef<T>(null);
  const [translate, setTranslate] = useState<Position>({ x: 0, y: 0 });
  const [topLeft, setTopLeft] = useState({ left: 0, top: 0 });
  const [isMoving, setIsMoving] = useState(false);

  const latestTranslateRef = useRef(translate);
  useEffect(() => {
    latestTranslateRef.current = translate;
  }, [translate]);

  const latestTopLeftRef = useRef(topLeft);
  useEffect(() => {
    latestTopLeftRef.current = topLeft;
  }, [topLeft]);

  // 拖拽状态
  const translateState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startTranslateX: 0,
    startTranslateY: 0,
  });

  const topLeftState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialElRect: {} as Rect,
    containerRect: {} as Rect,
  });

  // RAF 管理
  const rafIdRef = useRef<number | null>(null);
  const cancelRaf = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  // ====== 辅助函数 ======
  const computeContainerBoundary = (): Rect => {
    const { containerRef, offset: userOffset } = optionsRef.current.topLeft || {};
    const offset = { top: 0, left: 0, right: 0, bottom: 0, ...userOffset };

    let baseRect: Rect;
    if (containerRef?.current) {
      const cr = containerRef.current.getBoundingClientRect();
      baseRect = {
        top: cr.top,
        left: cr.left,
        right: cr.right,
        bottom: cr.bottom,
        width: cr.width,
        height: cr.height,
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

  // ====== Translate 模式逻辑 ======
  const handleTranslateStart = (e: MouseEvent | TouchEvent) => {
    if (!moveRef.current) return;

    const { x, y } = getClientCoord(e);
    const current = latestTranslateRef.current;

    translateState.current = {
      isDragging: true,
      startX: x,
      startY: y,
      startTranslateX: current.x,
      startTranslateY: current.y,
    };
    setIsMoving(true);
    optionsRef.current.onMoveStart?.(e);
  };

  const handleTranslateMove = (e: MouseEvent | TouchEvent) => {
    if (!translateState.current.isDragging) return;

    const { axis } = optionsRef.current;
    const { x, y } = getClientCoord(e);
    const { startX, startY, startTranslateX, startTranslateY } = translateState.current;

    let newX = startTranslateX;
    let newY = startTranslateY;

    if (axis !== 'y') newX += x - startX;
    if (axis !== 'x') newY += y - startY;

    const newPos = { x: newX, y: newY };
    const current = latestTranslateRef.current;

    if (newPos.x !== current.x || newPos.y !== current.y) {
      setTranslate(newPos);
      optionsRef.current.onMove?.(e, newPos);
    }
  };

  const handleTranslateEnd = (e: MouseEvent | TouchEvent) => {
    if (!translateState.current.isDragging) return;
    translateState.current.isDragging = false;
    setIsMoving(false);
    optionsRef.current.onMoveEnd?.(e);
  };

  // ====== TopLeft 模式逻辑 ======
  const handleTopLeftStart = (e: MouseEvent | TouchEvent) => {
    if (!moveRef.current) return;

    const { x, y } = getClientCoord(e);
    const domRect = moveRef.current.getBoundingClientRect();
    const elRect: Rect = {
      top: domRect.top,
      left: domRect.left,
      right: domRect.right,
      bottom: domRect.bottom,
      width: domRect.width,
      height: domRect.height,
    };

    const containerRect = computeContainerBoundary();

    topLeftState.current = {
      isDragging: true,
      startX: x,
      startY: y,
      initialElRect: elRect,
      containerRect,
    };
    setIsMoving(true);
    optionsRef.current.onMoveStart?.(e);
  };

  const handleTopLeftMove = (e: MouseEvent | TouchEvent) => {
    if (!topLeftState.current.isDragging) return;

    const { axis, topLeft: topLeftOpts } = optionsRef.current;
    const {  snapToBoundary = false, snapThreshold = 10 } = topLeftOpts || {};
    const { x, y } = getClientCoord(e);
    const { startX, startY, initialElRect, containerRect } = topLeftState.current;
    const { width, height } = initialElRect;

    let newLeft = initialElRect.left + (x - startX);
    let newTop = initialElRect.top + (y - startY);

    const { left: cL, right: cR, top: cT, bottom: cB } = containerRect;

    // X 轴
    if (axis !== 'y') {
      if (newLeft < cL) newLeft = cL;
      if (newLeft + width > cR) newLeft = cR - width;
      if (snapToBoundary) {
        if (Math.abs(newLeft - cL) <= snapThreshold) newLeft = cL;
        else if (Math.abs(newLeft - (cR - width)) <= snapThreshold) newLeft = cR - width;
      }
    }

    // Y 轴
    if (axis !== 'x') {
      if (newTop < cT) newTop = cT;
      if (newTop + height > cB) newTop = cB - height;
      if (snapToBoundary) {
        if (Math.abs(newTop - cT) <= snapThreshold) newTop = cT;
        else if (Math.abs(newTop - (cB - height)) <= snapThreshold) newTop = cB - height;
      }
    }

    const relLeft = newLeft - containerRect.left;
    const relTop = newTop - containerRect.top;
    const newTopLeft = { left: relLeft, top: relTop };
    const current = latestTopLeftRef.current;

    const EPS = Number.EPSILON * 100;
    if (
      Math.abs(newTopLeft.left - current.left) > EPS ||
      Math.abs(newTopLeft.top - current.top) > EPS
    ) {
      setTopLeft(newTopLeft);
      optionsRef.current.onMove?.(e, { x: relLeft, y: relTop });
    }
  };

  const handleTopLeftEnd = (e: MouseEvent | TouchEvent) => {
    if (!topLeftState.current.isDragging) return;
    topLeftState.current.isDragging = false;
    setIsMoving(false);
    optionsRef.current.onMoveEnd?.(e);
  };

  // ====== 统一事件处理器 ======
  const handleStart = (e: MouseEvent | TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    const { disabled } = optionsRef.current;
    if (disabled) return;
    const mode = optionsRef.current.mode ?? 'topLeft';
    if (mode === 'translate') handleTranslateStart(e);
    else handleTopLeftStart(e);
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    const { disabled } = optionsRef.current;
    if (disabled) return;

    cancelRaf();
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      // 再次检查（防卸载后执行）
      if (optionsRef.current.disabled) return;

      const mode = optionsRef.current.mode ?? 'topLeft';
      if (mode === 'translate') handleTranslateMove(e);
      else handleTopLeftMove(e);
    });
  };

  const handleEnd = (e: MouseEvent | TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    cancelRaf();
    const mode = optionsRef.current.mode ?? 'topLeft';
    if (mode === 'translate') handleTranslateEnd(e);
    else handleTopLeftEnd(e);
  };

  // ====== 事件绑定：仅 mount/unmount 时执行 ======
  useEffect(() => {
    const el = moveRef.current;
    if (!el) return;

    // 鼠标事件
    el.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    // 触摸事件（非 passive）
    el.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);

    return () => {
      cancelRaf();
      el.removeEventListener('mousedown', handleStart);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      el.removeEventListener('touchstart', handleStart);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };
  }, []); // ✅ 空依赖！

  return {
    moveRef,
    translate,
    topLeft,
    isMoving,
  };
}