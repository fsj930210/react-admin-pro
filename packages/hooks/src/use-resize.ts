import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

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

export interface Size {
	width: number;
	height: number;
}

export interface Position {
	x: number;
	y: number;
}

export type ResizeBounds<T extends HTMLElement = HTMLElement> =
	| "viewport"
	| false
	| React.RefObject<T | null>
	| (() => DOMRect);

export interface ResizeOptions<T extends HTMLElement = HTMLElement> {
	enabled?: boolean;
	disabled?: boolean;
	resizeOrigin?: "top-left" | "center";
	normalizeInitialSize?: boolean;
	freezeSizeOnStart?: boolean;
	minSize?: Partial<Size>;
	maxSize?: Partial<Size>;
	directions?: ResizeDirection[];
	bounds?: ResizeBounds<T>;
	containerRef?: React.RefObject<T | null>;
	edgeResize?: boolean;
	enableEdgeResize?: boolean;
	edgeSize?: number;
	cornerSize?: number;
	onResizeStart?: (direction: ResizeDirection, event: PointerEvent) => void;
	onResize?: (size: Size, position: Position, event: PointerEvent) => void;
	onResizeEnd?: (size: Size, position: Position, event: PointerEvent) => void;
}

export type ResizeHandleProps = React.HTMLAttributes<HTMLElement> & {
	"data-resize-direction": ResizeDirection;
};

interface ResizeSession {
	pointerId: number;
	direction: ResizeDirection;
	startClientX: number;
	startClientY: number;
	startSize: Size;
	startPosition: Position;
	startRect: DOMRect;
	boundsRect: DOMRect | null;
}

const allDirections: ResizeDirection[] = ["n", "s", "w", "e", "nw", "ne", "sw", "se"];

function getViewportRect() {
	return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
}

function resolveBounds<T extends HTMLElement>(
	bounds: ResizeBounds<T> | undefined,
	containerRef: React.RefObject<T | null> | undefined
) {
	if (bounds === false) return null;
	if (typeof bounds === "function") return bounds();
	if (bounds && bounds !== "viewport") return bounds.current?.getBoundingClientRect() ?? null;
	if (containerRef?.current) return containerRef.current.getBoundingClientRect();
	return getViewportRect();
}

function isAllowed(direction: ResizeDirection, directions?: ResizeDirection[]) {
	return (directions ?? allDirections).includes(direction);
}

export function getResizeCursor(direction: ResizeDirection | null) {
	if (!direction) return "default";
	return `${direction}-resize`;
}

function getResizeDirection(
	x: number,
	y: number,
	rect: DOMRect,
	edgeSize: number,
	cornerSize: number,
	directions?: ResizeDirection[]
) {
	const nearLeft = x >= rect.left - edgeSize && x <= rect.left + edgeSize;
	const nearRight = x >= rect.right - edgeSize && x <= rect.right + edgeSize;
	const nearTop = y >= rect.top - edgeSize && y <= rect.top + edgeSize;
	const nearBottom = y >= rect.bottom - edgeSize && y <= rect.bottom + edgeSize;
	const inLeftCorner = x >= rect.left - edgeSize && x <= rect.left + cornerSize;
	const inRightCorner = x >= rect.right - cornerSize && x <= rect.right + edgeSize;
	const inTopCorner = y >= rect.top - edgeSize && y <= rect.top + cornerSize;
	const inBottomCorner = y >= rect.bottom - cornerSize && y <= rect.bottom + edgeSize;

	const checks: Array<[boolean, ResizeDirection]> = [
		[inTopCorner && inLeftCorner, "nw"],
		[inTopCorner && inRightCorner, "ne"],
		[inBottomCorner && inLeftCorner, "sw"],
		[inBottomCorner && inRightCorner, "se"],
		[nearTop, "n"],
		[nearBottom, "s"],
		[nearLeft, "w"],
		[nearRight, "e"],
	];

	return checks.find(([matched, direction]) => matched && isAllowed(direction, directions))?.[1] ?? null;
}

function clamp(value: number, min: number, max: number) {
	if (min > max) return min;
	return Math.min(Math.max(value, min), max);
}

function normalizeSize(size: Size, options: ResizeOptions) {
	return {
		width: clamp(size.width, options.minSize?.width ?? 120, options.maxSize?.width ?? Infinity),
		height: clamp(size.height, options.minSize?.height ?? 80, options.maxSize?.height ?? Infinity),
	};
}

function computeResize(session: ResizeSession, event: PointerEvent, options: ResizeOptions) {
	const dx = event.clientX - session.startClientX;
	const dy = event.clientY - session.startClientY;
	const resizeOrigin = options.resizeOrigin ?? "top-left";
	const configuredMinWidth = options.minSize?.width ?? 120;
	const configuredMinHeight = options.minSize?.height ?? 80;
	const configuredMaxWidth = options.maxSize?.width ?? Infinity;
	const configuredMaxHeight = options.maxSize?.height ?? Infinity;
	const minWidth = Math.min(configuredMinWidth, session.startSize.width);
	const minHeight = Math.min(configuredMinHeight, session.startSize.height);
	const maxWidth = Math.max(configuredMaxWidth, session.startSize.width);
	const maxHeight = Math.max(configuredMaxHeight, session.startSize.height);
	const direction = session.direction;

	let width = session.startSize.width;
	let height = session.startSize.height;
	let x = session.startPosition.x;
	let y = session.startPosition.y;

	if (direction.includes("e")) width = session.startSize.width + dx;
	if (direction.includes("s")) height = session.startSize.height + dy;
	if (direction.includes("w")) width = session.startSize.width - dx;
	if (direction.includes("n")) height = session.startSize.height - dy;

	width = clamp(width, minWidth, maxWidth);
	height = clamp(height, minHeight, maxHeight);

	if (resizeOrigin === "top-left") {
		if (direction.includes("w")) x = session.startPosition.x + (session.startSize.width - width);
		if (direction.includes("n")) y = session.startPosition.y + (session.startSize.height - height);
	} else {
		const widthDelta = width - session.startSize.width;
		const heightDelta = height - session.startSize.height;
		if (direction.includes("e")) x = session.startPosition.x + widthDelta / 2;
		if (direction.includes("w")) x = session.startPosition.x - widthDelta / 2;
		if (direction.includes("s")) y = session.startPosition.y + heightDelta / 2;
		if (direction.includes("n")) y = session.startPosition.y - heightDelta / 2;
	}

	if (session.boundsRect) {
		const widthDelta = resizeOrigin === "center" ? (width - session.startSize.width) / 2 : 0;
		const heightDelta = resizeOrigin === "center" ? (height - session.startSize.height) / 2 : 0;
		const left = session.startRect.left + x - session.startPosition.x - widthDelta;
		const top = session.startRect.top + y - session.startPosition.y - heightDelta;
		const right = left + width;
		const bottom = top + height;

		if (direction.includes("w") && left < session.boundsRect.left) {
			const diff = session.boundsRect.left - left;
			x += diff;
			width -= diff;
		}
		if (direction.includes("n") && top < session.boundsRect.top) {
			const diff = session.boundsRect.top - top;
			y += diff;
			height -= diff;
		}
		if (direction.includes("e") && right > session.boundsRect.right) {
			width -= right - session.boundsRect.right;
		}
		if (direction.includes("s") && bottom > session.boundsRect.bottom) {
			height -= bottom - session.boundsRect.bottom;
		}

		width = Math.max(width, minWidth);
		height = Math.max(height, minHeight);

		if (resizeOrigin === "center") {
			const nextWidthDelta = width - session.startSize.width;
			const nextHeightDelta = height - session.startSize.height;
			if (direction.includes("e")) x = session.startPosition.x + nextWidthDelta / 2;
			if (direction.includes("w")) x = session.startPosition.x - nextWidthDelta / 2;
			if (direction.includes("s")) y = session.startPosition.y + nextHeightDelta / 2;
			if (direction.includes("n")) y = session.startPosition.y - nextHeightDelta / 2;
		}
	}

	return {
		size: {
			width: clamp(width, minWidth, maxWidth),
			height: clamp(height, minHeight, maxHeight),
		},
		position: { x, y },
	};
}

export function useResize<T extends HTMLElement = HTMLElement>(options: ResizeOptions<T> = {}) {
	const optionsRef = useRef(options);
	optionsRef.current = options;

	const [targetNode, setTargetNode] = useState<T | null>(null);
	const [size, setSizeState] = useState<Size | null>(null);
	const [appliedSize, setAppliedSize] = useState<Partial<Size>>({});
	const [position, setPositionState] = useState<Position>({ x: 0, y: 0 });
	const [isResizing, setIsResizing] = useState(false);
	const [direction, setDirection] = useState<ResizeDirection | null>(null);
	const [cursor, setCursor] = useState("default");

	const sizeRef = useRef<Size | null>(size);
	const positionRef = useRef(position);
	const sessionRef = useRef<ResizeSession | null>(null);
	const rafRef = useRef<number | null>(null);
	const latestEventRef = useRef<PointerEvent | null>(null);

	const setSize = useCallback((next: Size) => {
		sizeRef.current = next;
		setSizeState(next);
	}, []);

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

	const flushResize = useCallback(() => {
		rafRef.current = null;
		const session = sessionRef.current;
		const event = latestEventRef.current;
		if (!session || !event) return;

		const next = computeResize(session, event, optionsRef.current);
		setSize(next.size);
		setAppliedSize((current) => ({
			...current,
			...(session.direction.includes("e") || session.direction.includes("w")
				? { width: next.size.width }
				: {}),
			...(session.direction.includes("n") || session.direction.includes("s")
				? { height: next.size.height }
				: {}),
		}));
		setPosition(next.position);
		optionsRef.current.onResize?.(next.size, next.position, event);
	}, [setSize, setPosition]);

	const handlePointerMove = useCallback(
		(event: PointerEvent) => {
			const session = sessionRef.current;
			if (!session || event.pointerId !== session.pointerId) return;
			latestEventRef.current = event;
			if (event.cancelable) event.preventDefault();
			if (rafRef.current === null) {
				rafRef.current = requestAnimationFrame(flushResize);
			}
		},
		[flushResize]
	);

	const cleanupDocumentEvents = useCallback(() => {
		document.removeEventListener("pointermove", handlePointerMove);
		document.removeEventListener("pointerup", handlePointerUp);
		document.removeEventListener("pointercancel", handlePointerUp);
	}, [handlePointerMove]);

	function handlePointerUp(event: PointerEvent) {
		const session = sessionRef.current;
		if (!session || event.pointerId !== session.pointerId) return;
		cancelRaf();
		sessionRef.current = null;
		setIsResizing(false);
		setDirection(null);
		cleanupDocumentEvents();
		if (sizeRef.current) {
			optionsRef.current.onResizeEnd?.(sizeRef.current, positionRef.current, event);
		}
	}

	const startResize = useCallback(
		(event: PointerEvent, resizeDirection: ResizeDirection | null) => {
			const { enabled = true, disabled = false, directions, bounds, containerRef } = optionsRef.current;
			if (
				sessionRef.current ||
				!enabled ||
				disabled ||
				!targetNode ||
				!resizeDirection ||
				!isAllowed(resizeDirection, directions)
			) {
				return;
			}
			if (event.cancelable) event.preventDefault();
			const rect = targetNode.getBoundingClientRect();
			const startSize = sizeRef.current ?? { width: rect.width, height: rect.height };
			if (optionsRef.current.freezeSizeOnStart) {
				sizeRef.current = startSize;
				setSizeState(startSize);
				setAppliedSize(startSize);
				targetNode.style.width = `${startSize.width}px`;
				targetNode.style.height = `${startSize.height}px`;
				targetNode.style.boxSizing = "border-box";
			}
			const rawBounds = resolveBounds(bounds, containerRef);
			sessionRef.current = {
				pointerId: event.pointerId,
				direction: resizeDirection,
				startClientX: event.clientX,
				startClientY: event.clientY,
				startSize,
				startPosition: positionRef.current,
				startRect: rect,
				boundsRect: rawBounds,
			};
			setIsResizing(true);
			setDirection(resizeDirection);
			document.addEventListener("pointermove", handlePointerMove, { passive: false });
			document.addEventListener("pointerup", handlePointerUp);
			document.addEventListener("pointercancel", handlePointerUp);
			optionsRef.current.onResizeStart?.(resizeDirection, event);
		},
		[targetNode, handlePointerMove]
	);

	const handleEdgePointerDown = useCallback(
		(event: PointerEvent) => {
			if (!targetNode) return;
			const { edgeResize, enableEdgeResize, edgeSize = 12, cornerSize = Math.max(edgeSize * 2, 24), directions } = optionsRef.current;
			if (!edgeResize && !enableEdgeResize) return;
			const nextDirection = getResizeDirection(
				event.clientX,
				event.clientY,
				targetNode.getBoundingClientRect(),
				edgeSize,
				cornerSize,
				directions
			);
			startResize(event, nextDirection);
		},
		[targetNode, startResize]
	);

	const handleEdgePointerMove = useCallback(
		(event: PointerEvent) => {
			if (!targetNode || sessionRef.current) return;
			const { edgeResize, enableEdgeResize, edgeSize = 12, cornerSize = Math.max(edgeSize * 2, 24), directions } = optionsRef.current;
			if (!edgeResize && !enableEdgeResize) {
				if (cursor !== "default") setCursor("default");
				return;
			}
			const nextDirection = getResizeDirection(
				event.clientX,
				event.clientY,
				targetNode.getBoundingClientRect(),
				edgeSize,
				cornerSize,
				directions
			);
			const nextCursor = getResizeCursor(nextDirection);
			setCursor((current) => (current === nextCursor ? current : nextCursor));
		},
		[targetNode, cursor]
	);

	useEffect(() => {
		if (!targetNode) return;
		targetNode.addEventListener("pointerdown", handleEdgePointerDown);
		targetNode.addEventListener("pointermove", handleEdgePointerMove);
		return () => {
			targetNode.removeEventListener("pointerdown", handleEdgePointerDown);
			targetNode.removeEventListener("pointermove", handleEdgePointerMove);
		};
	}, [targetNode, handleEdgePointerDown, handleEdgePointerMove]);

	useLayoutEffect(() => {
		if (!targetNode || !optionsRef.current.normalizeInitialSize) return;
		const rect = targetNode.getBoundingClientRect();
		const next = normalizeSize({ width: rect.width, height: rect.height }, optionsRef.current);
		if (Math.abs(next.width - rect.width) < 0.5 && Math.abs(next.height - rect.height) < 0.5) {
			return;
		}
		sizeRef.current = next;
		setSizeState(next);
		setAppliedSize(next);
	}, [targetNode]);

	useEffect(() => {
		return () => {
			cancelRaf();
			cleanupDocumentEvents();
		};
	}, [cancelRaf, cleanupDocumentEvents]);

	const targetRef = useCallback((node: T | null) => {
		setTargetNode(node);
	}, []);

	const getHandleProps = useCallback(
		(resizeDirection: ResizeDirection): ResizeHandleProps => ({
			onPointerDown: (event) => startResize(event.nativeEvent, resizeDirection),
			style: { cursor: getResizeCursor(resizeDirection), touchAction: "none" },
			"data-resize-direction": resizeDirection,
		}),
		[startResize]
	);

	const transform = useMemo(
		() => `translate(${position.x}px, ${position.y}px)`,
		[position.x, position.y]
	);

	const style = useMemo<React.CSSProperties>(
		() => ({
			width: appliedSize.width ? `${appliedSize.width}px` : undefined,
			height: appliedSize.height ? `${appliedSize.height}px` : undefined,
			transform,
			cursor,
			willChange: isResizing ? "width, height, transform" : undefined,
		}),
		[appliedSize, transform, cursor, isResizing]
	);

	return {
		targetRef,
		resizeRef: targetRef,
		getHandleProps,
		size,
		position,
		transform,
		style,
		cursor,
		direction,
		isResizing,
		setSize,
		setPosition,
		reset: () => {
			sizeRef.current = null;
			setSizeState(null);
			setAppliedSize({});
			setPosition({ x: 0, y: 0 });
		},
	};
}
