import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface Position {
  x: number;
  y: number;
}

export interface Offset {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export type MoveAxis = "x" | "y" | "both";
export type MoveBounds<T extends HTMLElement = HTMLElement> =
  | "viewport"
  | false
  | React.RefObject<T | null>
  | (() => DOMRect);
export type BoundaryMode = "contain" | "keep-handle-visible" | "none";

export interface MoveOptions<T extends HTMLElement = HTMLElement> {
  enabled?: boolean;
  disabled?: boolean;
  axis?: MoveAxis;
  bounds?: MoveBounds<T>;
  containerRef?: React.RefObject<T | null>;
  boundaryMode?: BoundaryMode;
  offset?: Offset;
  minVisibleHandleSize?: Partial<{ width: number; height: number }>;
  dragThreshold?: number;
  onMoveStart?: (event: PointerEvent) => void;
  onMove?: (event: PointerEvent, position: Position) => void;
  onMoveEnd?: (event: PointerEvent, position: Position) => void;
}

interface MoveSession {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startPosition: Position;
  targetRect: DOMRect;
  handleRect: DOMRect;
  boundsRect: DOMRect | null;
  dragged: boolean;
}

const defaultOffset = { top: 0, left: 0, right: 0, bottom: 0 };

function getViewportRect() {
  return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
}

function resolveBounds<T extends HTMLElement>(
  bounds: MoveBounds<T> | undefined,
  containerRef: React.RefObject<T | null> | undefined
) {
  if (bounds === false) return null;
  if (typeof bounds === "function") return bounds();
  if (bounds && bounds !== "viewport") return bounds.current?.getBoundingClientRect() ?? null;
  if (containerRef?.current) return containerRef.current.getBoundingClientRect();
  return getViewportRect();
}

function applyOffset(rect: DOMRect, offset: Offset | undefined) {
  const value = { ...defaultOffset, ...offset };
  return new DOMRect(
    rect.left + value.left,
    rect.top + value.top,
    rect.width - value.left - value.right,
    rect.height - value.top - value.bottom
  );
}

function clamp(value: number, min: number, max: number) {
  if (min > max) return min;
  return Math.min(Math.max(value, min), max);
}

export function useMove<T extends HTMLElement = HTMLElement, H extends HTMLElement = T>(
  options: MoveOptions<T> = {}
) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [targetNode, setTargetNode] = useState<T | null>(null);
  const [handleNode, setHandleNode] = useState<H | null>(null);
  const [position, setPositionState] = useState<Position>({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [isDragged, setIsDragged] = useState(false);

  const positionRef = useRef(position);
  const sessionRef = useRef<MoveSession | null>(null);
  const rafRef = useRef<number | null>(null);
  const latestEventRef = useRef<PointerEvent | null>(null);

  const setPosition = useCallback((next: Position) => {
    positionRef.current = next;
    setPositionState(next);
  }, []);

  const cancelRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const calcPosition = useCallback((event: PointerEvent) => {
    const session = sessionRef.current;
    if (!session) return positionRef.current;

    const {
      axis = "both",
      boundaryMode = "keep-handle-visible",
      minVisibleHandleSize,
    } = optionsRef.current;
    const dx = event.clientX - session.startClientX;
    const dy = event.clientY - session.startClientY;
    let nextX = axis === "y" ? session.startPosition.x : session.startPosition.x + dx;
    let nextY = axis === "x" ? session.startPosition.y : session.startPosition.y + dy;

    if (!session.boundsRect || boundaryMode === "none") {
      return { x: nextX, y: nextY };
    }

    const bounds = session.boundsRect;
    if (boundaryMode === "contain") {
      nextX = clamp(
        nextX,
        bounds.left - session.targetRect.left + session.startPosition.x,
        bounds.right - session.targetRect.right + session.startPosition.x
      );
      nextY = clamp(
        nextY,
        bounds.top - session.targetRect.top + session.startPosition.y,
        bounds.bottom - session.targetRect.bottom + session.startPosition.y
      );
    } else {
      const visibleWidth = Math.min(minVisibleHandleSize?.width ?? 96, session.handleRect.width);
      const visibleHeight = Math.min(minVisibleHandleSize?.height ?? 36, session.handleRect.height);
      nextX = clamp(
        nextX,
        bounds.left + visibleWidth - session.handleRect.right + session.startPosition.x,
        bounds.right - visibleWidth - session.handleRect.left + session.startPosition.x
      );
      nextY = clamp(
        nextY,
        bounds.top + visibleHeight - session.handleRect.bottom + session.startPosition.y,
        bounds.bottom - visibleHeight - session.handleRect.top + session.startPosition.y
      );
    }

    return { x: nextX, y: nextY };
  }, []);

  const flushMove = useCallback(() => {
    rafRef.current = null;
    const event = latestEventRef.current;
    const session = sessionRef.current;
    if (!event || !session) return;

    const next = calcPosition(event);
    const current = positionRef.current;
    if (Math.abs(next.x - current.x) < 0.5 && Math.abs(next.y - current.y) < 0.5) {
      return;
    }

    const distance = Math.hypot(
      event.clientX - session.startClientX,
      event.clientY - session.startClientY
    );
    const threshold = optionsRef.current.dragThreshold ?? 3;
    if (!session.dragged && distance >= threshold) {
      session.dragged = true;
      setIsDragged(true);
    }

    setPosition(next);
    optionsRef.current.onMove?.(event, next);
  }, [calcPosition, setPosition]);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const session = sessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;
      latestEventRef.current = event;
      if (event.cancelable) event.preventDefault();
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flushMove);
      }
    },
    [flushMove]
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      const session = sessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;
      cancelRaf();
      sessionRef.current = null;
      setIsMoving(false);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
      optionsRef.current.onMoveEnd?.(event, positionRef.current);
    },
    [cancelRaf, handlePointerMove]
  );

  const cleanupDocumentEvents = useCallback(() => {
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
    document.removeEventListener("pointercancel", handlePointerUp);
  }, [handlePointerMove, handlePointerUp]);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      const { enabled = true, disabled = false, bounds, containerRef, offset } = optionsRef.current;
      if (!enabled || disabled || event.button !== 0 || !targetNode) return;
      if (event.cancelable) event.preventDefault();

      const actualHandle = (handleNode ?? targetNode) as HTMLElement;
      const rawBounds = resolveBounds(bounds, containerRef);
      sessionRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPosition: positionRef.current,
        targetRect: targetNode.getBoundingClientRect(),
        handleRect: actualHandle.getBoundingClientRect(),
        boundsRect: rawBounds ? applyOffset(rawBounds, offset) : null,
        dragged: false,
      };
      setIsDragged(false);
      setIsMoving(true);
      document.addEventListener("pointermove", handlePointerMove, { passive: false });
      document.addEventListener("pointerup", handlePointerUp);
      document.addEventListener("pointercancel", handlePointerUp);
      optionsRef.current.onMoveStart?.(event);
    },
    [targetNode, handleNode, handlePointerMove, handlePointerUp]
  );

  useEffect(() => {
    const node = handleNode ?? targetNode;
    if (!node) return;
    node.addEventListener("pointerdown", handlePointerDown);
    return () => node.removeEventListener("pointerdown", handlePointerDown);
  }, [targetNode, handleNode, handlePointerDown]);

  useEffect(() => {
    return () => {
      cancelRaf();
      cleanupDocumentEvents();
    };
  }, [cancelRaf, cleanupDocumentEvents]);

  const targetRef = useCallback((node: T | null) => {
    setTargetNode(node);
  }, []);

  const handleRef = useCallback((node: H | null) => {
    setHandleNode(node);
  }, []);

  const transform = useMemo(
    () => `translate(${position.x}px, ${position.y}px)`,
    [position.x, position.y]
  );

  const style = useMemo<React.CSSProperties>(
    () => ({
      transform,
      willChange: isMoving ? "transform" : undefined,
    }),
    [transform, isMoving]
  );

  return {
    targetRef,
    handleRef,
    moveRef: targetRef,
    position,
    transform,
    style,
    isMoving,
    isDragged,
    setPosition,
    reset: () => setPosition({ x: 0, y: 0 }),
  };
}
