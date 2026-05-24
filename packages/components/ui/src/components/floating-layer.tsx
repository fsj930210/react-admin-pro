import { cn } from "@rap/utils";
import {
	useLayoutEffect,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type ReactNode,
	type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { When } from "./when";

export type FloatingLayerAlign = "start" | "center" | "end";
export type FloatingLayerSide = "top" | "right" | "bottom" | "left";

export interface FloatingLayerProps {
	align?: FloatingLayerAlign;
	children: ReactNode;
	className?: string;
	collisionPadding?: number;
	estimatedHeight?: number;
	estimatedWidth?: number;
	onOpenChange: (open: boolean) => void;
	open: boolean;
	point?: { x: number; y: number };
	side?: FloatingLayerSide;
	sideOffset?: number;
	style?: CSSProperties;
	triggerRef?: RefObject<HTMLElement | null>;
}

function getInlinePosition({
	align,
	collisionPadding,
	layerWidth,
	point,
	triggerRect,
}: {
	align: FloatingLayerAlign;
	collisionPadding: number;
	layerWidth: number;
	point?: { x: number; y: number };
	triggerRect?: DOMRect;
}) {
	if (point) {
		return point.x;
	}
	if (!triggerRect) {
		return collisionPadding;
	}
	if (align === "center") {
		return triggerRect.left + (triggerRect.width - layerWidth) / 2;
	}
	if (align === "end") {
		return triggerRect.right - layerWidth;
	}
	return triggerRect.left;
}

function getBlockPosition({
	collisionPadding,
	layerHeight,
	point,
	side,
	sideOffset,
	triggerRect,
}: {
	collisionPadding: number;
	layerHeight: number;
	point?: { x: number; y: number };
	side: FloatingLayerSide;
	sideOffset: number;
	triggerRect?: DOMRect;
}) {
	if (point) {
		return point.y;
	}
	if (!triggerRect) {
		return collisionPadding;
	}
	if (side === "top") {
		return triggerRect.top - layerHeight - sideOffset;
	}
	if (side === "left" || side === "right") {
		return triggerRect.top;
	}
	return triggerRect.bottom + sideOffset;
}

function getInitialPosition(point?: { x: number; y: number }): CSSProperties {
	if (point) {
		return {
			left: point.x,
			top: point.y,
			visibility: "visible",
		};
	}
	return {
		left: -9999,
		top: -9999,
		visibility: "hidden",
	};
}

export function FloatingLayer({
	align = "start",
	children,
	className,
	collisionPadding = 8,
	estimatedHeight = 240,
	estimatedWidth = 208,
	onOpenChange,
	open,
	point,
	side = "bottom",
	sideOffset = 4,
	style,
	triggerRef,
}: FloatingLayerProps) {
	const layerRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState<CSSProperties>(() => getInitialPosition(point));

	useLayoutEffect(() => {
		if (!open) {
			return;
		}

		const updatePosition = () => {
			const layer = layerRef.current;
			const layerWidth = layer?.offsetWidth || estimatedWidth;
			const layerHeight = layer?.offsetHeight || estimatedHeight;
			const triggerRect = triggerRef?.current?.getBoundingClientRect();
			const baseLeft = getInlinePosition({
				align,
				collisionPadding,
				layerWidth,
				point,
				triggerRect,
			});
			const baseTop = getBlockPosition({
				collisionPadding,
				layerHeight,
				point,
				side,
				sideOffset,
				triggerRect,
			});
			const maxLeft = window.innerWidth - layerWidth - collisionPadding;
			const maxTop = window.innerHeight - layerHeight - collisionPadding;

			setPosition({
				left: Math.max(collisionPadding, Math.min(baseLeft, maxLeft)),
				top: Math.max(collisionPadding, Math.min(baseTop, maxTop)),
				visibility: "visible",
			});
		};

		updatePosition();
		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition, true);

		return () => {
			window.removeEventListener("resize", updatePosition);
			window.removeEventListener("scroll", updatePosition, true);
		};
	}, [align, collisionPadding, estimatedHeight, estimatedWidth, open, point, side, sideOffset, triggerRef]);

	useEffect(() => {
		if (!open) {
			return;
		}

		const closeOnOutsidePointerDown = (event: PointerEvent) => {
			const target = event.target as Node | null;
			if (triggerRef?.current?.contains(target) || layerRef.current?.contains(target)) {
				return;
			}
			onOpenChange(false);
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onOpenChange(false);
			}
		};

		document.addEventListener("pointerdown", closeOnOutsidePointerDown);
		document.addEventListener("keydown", closeOnEscape);

		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePointerDown);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [onOpenChange, open, triggerRef]);

	return (
		<When condition={open}>
			{createPortal(
				<div
					ref={layerRef}
					className={cn("fixed z-[110]", className)}
					style={{ ...style, ...position }}
				>
					{children}
				</div>,
				document.body,
			)}
		</When>
	);
}
