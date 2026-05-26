import { useComposedRefs } from "@rap/lib/compose-refs";
import { cn } from "@rap/utils";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";
import { createPortal } from "react-dom";
import { When } from "./when";

export type FloatingLayerAlign = "start" | "center" | "end";
export type FloatingLayerSide = "top" | "right" | "bottom" | "left";
export type FloatingLayerContainer =
	| Element
	| DocumentFragment
	| null
	| ((trigger: HTMLElement | null) => Element | DocumentFragment | null);
export type FloatingLayerPositionStrategy = "fixed" | "absolute";
export type FloatingLayerTriggerMode = "click" | "hover";

const DEFAULT_TRIGGER_MODES = ["click"] as const satisfies readonly FloatingLayerTriggerMode[];

type FloatingLayerContextValue = {
	closeByHover: () => void;
	openByHover: () => void;
	onOpenChange: (open: boolean) => void;
	open: boolean;
	setTriggerElement: (element: HTMLElement | null) => void;
	toggleByClick: () => void;
	triggerElement: HTMLElement | null;
	triggerModes: readonly FloatingLayerTriggerMode[];
};

export interface FloatingLayerRootProps {
	children: React.ReactNode;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	open?: boolean;
	trigger?: readonly FloatingLayerTriggerMode[];
}

export interface FloatingLayerContentProps extends React.ComponentProps<"div"> {
	align?: FloatingLayerAlign;
	collisionPadding?: number;
	container?: FloatingLayerContainer;
	estimatedHeight?: number;
	estimatedWidth?: number;
	onOpenChange?: (open: boolean) => void;
	open?: boolean;
	point?: { x: number; y: number };
	positionStrategy?: FloatingLayerPositionStrategy;
	side?: FloatingLayerSide;
	sideOffset?: number;
}

export interface FloatingLayerTriggerProps extends React.ComponentProps<"button"> {
	asChild?: boolean;
}

export type FloatingLayerProps = FloatingLayerRootProps & FloatingLayerContentProps;

const FloatingLayerContext = React.createContext<FloatingLayerContextValue | null>(null);

function useFloatingLayerContext(name: string) {
	const context = React.useContext(FloatingLayerContext);

	if (!context) {
		throw new Error(`${name} must be used within FloatingLayer`);
	}

	return context;
}

function isControlledContentProps(props: FloatingLayerProps) {
	return (
		props.align !== undefined ||
		props.className !== undefined ||
		props.collisionPadding !== undefined ||
		props.container !== undefined ||
		props.estimatedHeight !== undefined ||
		props.estimatedWidth !== undefined ||
		props.point !== undefined ||
		props.positionStrategy !== undefined ||
		props.side !== undefined ||
		props.sideOffset !== undefined ||
		props.style !== undefined
	);
}

function resolveContainer(
	container: FloatingLayerContainer | undefined,
	trigger: HTMLElement | null,
) {
	if (typeof document === "undefined") {
		return null;
	}

	if (typeof container === "function") {
		return container(trigger) ?? document.body;
	}

	return container ?? document.body;
}

function getDefaultStrategy(
	container: Element | DocumentFragment | null,
	positionStrategy?: FloatingLayerPositionStrategy,
) {
	if (positionStrategy) {
		return positionStrategy;
	}

	if (typeof document === "undefined") {
		return "fixed";
	}

	return container && container !== document.body ? "absolute" : "fixed";
}

function getInlinePosition({
	align,
	layerWidth,
	point,
	triggerRect,
}: {
	align: FloatingLayerAlign;
	layerWidth: number;
	point?: { x: number; y: number };
	triggerRect?: DOMRect;
}) {
	if (point) {
		return point.x;
	}
	if (!triggerRect) {
		return 0;
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
	layerHeight,
	point,
	side,
	sideOffset,
	triggerRect,
}: {
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
		return 0;
	}
	if (side === "top") {
		return triggerRect.top - layerHeight - sideOffset;
	}
	if (side === "left" || side === "right") {
		return triggerRect.top;
	}
	return triggerRect.bottom + sideOffset;
}

function getAbsoluteAnchor(
	layer: HTMLElement | null,
	container: Element | DocumentFragment | null,
) {
	if (layer?.offsetParent instanceof Element) {
		return layer.offsetParent;
	}
	if (container instanceof Element) {
		return container;
	}
	return document.documentElement;
}

function getAnchorScroll(anchor: Element) {
	if (anchor === document.documentElement || anchor === document.body) {
		return { left: window.scrollX, top: window.scrollY };
	}

	return { left: anchor.scrollLeft, top: anchor.scrollTop };
}

function getPosition({
	align,
	collisionPadding,
	container,
	estimatedHeight,
	estimatedWidth,
	layer,
	point,
	side,
	sideOffset,
	strategy,
	trigger,
}: {
	align: FloatingLayerAlign;
	collisionPadding: number;
	container: Element | DocumentFragment | null;
	estimatedHeight: number;
	estimatedWidth: number;
	layer: HTMLDivElement | null;
	point?: { x: number; y: number };
	side: FloatingLayerSide;
	sideOffset: number;
	strategy: FloatingLayerPositionStrategy;
	trigger: HTMLElement | null;
}): React.CSSProperties {
	const layerWidth = layer?.offsetWidth || estimatedWidth;
	const layerHeight = layer?.offsetHeight || estimatedHeight;
	const triggerRect = trigger?.getBoundingClientRect();
	const baseLeft = getInlinePosition({ align, layerWidth, point, triggerRect });
	const baseTop = getBlockPosition({ layerHeight, point, side, sideOffset, triggerRect });
	const maxLeft = window.innerWidth - layerWidth - collisionPadding;
	const maxTop = window.innerHeight - layerHeight - collisionPadding;
	const viewportLeft = Math.max(collisionPadding, Math.min(baseLeft, maxLeft));
	const viewportTop = Math.max(collisionPadding, Math.min(baseTop, maxTop));

	if (strategy === "fixed") {
		return {
			left: viewportLeft,
			position: "fixed",
			top: viewportTop,
			visibility: "visible",
		};
	}

	const anchor = getAbsoluteAnchor(layer, container);
	const anchorRect = anchor.getBoundingClientRect();
	const anchorScroll = getAnchorScroll(anchor);

	return {
		left: viewportLeft - anchorRect.left + anchorScroll.left,
		position: "absolute",
		top: viewportTop - anchorRect.top + anchorScroll.top,
		visibility: "visible",
	};
}

function getInitialPosition(point?: { x: number; y: number }): React.CSSProperties {
	if (point) {
		return {
			left: point.x,
			position: "fixed",
			top: point.y,
			visibility: "visible",
		};
	}

	return {
		left: -9999,
		position: "fixed",
		top: -9999,
		visibility: "hidden",
	};
}

function FloatingLayerRoot({
	children,
	defaultOpen = false,
	onOpenChange,
	open: openProp,
	trigger = DEFAULT_TRIGGER_MODES,
}: FloatingLayerRootProps) {
	const [triggerElement, setTriggerElement] = React.useState<HTMLElement | null>(null);
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
	const hoverCloseTimerRef = React.useRef<number | null>(null);
	const openedByHoverRef = React.useRef(false);
	const open = openProp ?? uncontrolledOpen;
	const isControlled = openProp !== undefined;

	const setOpen = React.useCallback(
		(nextOpen: boolean) => {
			if (!nextOpen) {
				openedByHoverRef.current = false;
			}

			if (!isControlled) {
				setUncontrolledOpen(nextOpen);
			}
			onOpenChange?.(nextOpen);
		},
		[isControlled, onOpenChange],
	);

	const clearHoverCloseTimer = React.useCallback(() => {
		if (hoverCloseTimerRef.current === null) {
			return;
		}

		window.clearTimeout(hoverCloseTimerRef.current);
		hoverCloseTimerRef.current = null;
	}, []);

	const openByHover = React.useCallback(() => {
		clearHoverCloseTimer();
		openedByHoverRef.current = true;
		setOpen(true);
	}, [clearHoverCloseTimer, setOpen]);

	const closeByHover = React.useCallback(() => {
		clearHoverCloseTimer();
		hoverCloseTimerRef.current = window.setTimeout(() => {
			hoverCloseTimerRef.current = null;

			if (!openedByHoverRef.current) {
				return;
			}

			openedByHoverRef.current = false;
			setOpen(false);
		}, 80);
	}, [clearHoverCloseTimer, setOpen]);

	const toggleByClick = React.useCallback(() => {
		clearHoverCloseTimer();
		openedByHoverRef.current = false;
		setOpen(!open);
	}, [clearHoverCloseTimer, open, setOpen]);

	React.useEffect(() => clearHoverCloseTimer, [clearHoverCloseTimer]);

	const context = React.useMemo<FloatingLayerContextValue>(
		() => ({
			closeByHover,
			onOpenChange: setOpen,
			openByHover,
			open,
			setTriggerElement,
			toggleByClick,
			triggerElement,
			triggerModes: trigger,
		}),
		[closeByHover, open, openByHover, setOpen, toggleByClick, trigger, triggerElement],
	);

	return <FloatingLayerContext.Provider value={context}>{children}</FloatingLayerContext.Provider>;
}

const FloatingLayerTrigger = React.forwardRef<HTMLButtonElement, FloatingLayerTriggerProps>(
	({ asChild, onClick, onPointerEnter, onPointerLeave, type = "button", ...props }, ref) => {
		const context = useFloatingLayerContext("FloatingLayerTrigger");
		const TriggerPrimitive = asChild ? SlotPrimitive.Slot : "button";
		const composedRef = useComposedRefs(ref, context.setTriggerElement);
		const triggerProps = asChild ? props : { ...props, type };
		const clickEnabled = context.triggerModes.includes("click");
		const hoverEnabled = context.triggerModes.includes("hover");

		return (
			<TriggerPrimitive
				ref={composedRef}
				{...triggerProps}
				aria-expanded={context.open}
				data-slot="floating-layer-trigger"
				data-state={context.open ? "open" : "closed"}
				onClick={(event) => {
					onClick?.(event);
					if (event.defaultPrevented || !clickEnabled) {
						return;
					}
					context.toggleByClick();
				}}
				onPointerEnter={(event) => {
					onPointerEnter?.(event);
					if (event.defaultPrevented || !hoverEnabled) {
						return;
					}
					context.openByHover();
				}}
				onPointerLeave={(event) => {
					onPointerLeave?.(event);
					if (event.defaultPrevented || !hoverEnabled) {
						return;
					}
					context.closeByHover();
				}}
			/>
		);
	},
);
FloatingLayerTrigger.displayName = "FloatingLayerTrigger";

const FloatingLayerContent = React.forwardRef<HTMLDivElement, FloatingLayerContentProps>(
	(
		{
			align = "start",
			children,
			className,
			collisionPadding = 8,
			container: containerProp,
			estimatedHeight = 240,
			estimatedWidth = 208,
			onOpenChange,
			open: openProp,
			point,
			positionStrategy,
			side = "bottom",
			sideOffset = 4,
			style,
			...props
		},
		ref,
	) => {
		const context = useFloatingLayerContext("FloatingLayerContent");
		const layerRef = React.useRef<HTMLDivElement>(null);
		const composedRef = useComposedRefs(ref, layerRef);
		const trigger = context.triggerElement;
		const container = resolveContainer(containerProp, trigger);
		const strategy = getDefaultStrategy(container, positionStrategy);
		const open = openProp ?? context.open;
		const setOpen = onOpenChange ?? context.onOpenChange;
		const hoverEnabled = context.triggerModes.includes("hover");
		const [position, setPosition] = React.useState<React.CSSProperties>(() =>
			getInitialPosition(point),
		);

		React.useLayoutEffect(() => {
			if (!open) {
				return;
			}

			const updatePosition = () => {
				setPosition(
					getPosition({
						align,
						collisionPadding,
						container,
						estimatedHeight,
						estimatedWidth,
						layer: layerRef.current,
						point,
						side,
						sideOffset,
						strategy,
						trigger,
					}),
				);
			};

			updatePosition();

			window.addEventListener("resize", updatePosition);
			window.addEventListener("scroll", updatePosition, true);

			return () => {
				window.removeEventListener("resize", updatePosition);
				window.removeEventListener("scroll", updatePosition, true);
			};
		}, [
			align,
			collisionPadding,
			container,
			estimatedHeight,
			estimatedWidth,
			open,
			point,
			side,
			sideOffset,
			strategy,
			trigger,
		]);

		React.useEffect(() => {
			if (!open) {
				return;
			}

			const closeOnOutsidePointerDown = (event: PointerEvent) => {
				const target = event.target as Node | null;
				if (trigger?.contains(target) || layerRef.current?.contains(target)) {
					return;
				}
				setOpen(false);
			};
			const closeOnEscape = (event: KeyboardEvent) => {
				if (event.key === "Escape") {
					setOpen(false);
				}
			};

			document.addEventListener("pointerdown", closeOnOutsidePointerDown);
			document.addEventListener("keydown", closeOnEscape);

			return () => {
				document.removeEventListener("pointerdown", closeOnOutsidePointerDown);
				document.removeEventListener("keydown", closeOnEscape);
			};
		}, [open, setOpen, trigger]);

		if (!container) {
			return null;
		}

		return (
			<When condition={open}>
				{createPortal(
					<div
						ref={composedRef}
						{...props}
						className={cn("z-[1000]", className)}
						data-slot="floating-layer-content"
						data-state={open ? "open" : "closed"}
						style={{ ...style, ...position }}
						onPointerEnter={(event) => {
							props.onPointerEnter?.(event);
							if (event.defaultPrevented || !hoverEnabled) {
								return;
							}
							context.openByHover();
						}}
						onPointerLeave={(event) => {
							props.onPointerLeave?.(event);
							if (event.defaultPrevented || !hoverEnabled) {
								return;
							}
							context.closeByHover();
						}}
					>
						{children}
					</div>,
					container,
				)}
			</When>
		);
	},
);
FloatingLayerContent.displayName = "FloatingLayerContent";

function FloatingLayer(props: FloatingLayerProps) {
	if (isControlledContentProps(props)) {
		const { children, defaultOpen, onOpenChange, open, trigger, ...contentProps } = props;

		return (
			<FloatingLayerRoot
				defaultOpen={defaultOpen}
				onOpenChange={onOpenChange}
				open={open}
				trigger={trigger}
			>
				<FloatingLayerContent {...contentProps}>{children}</FloatingLayerContent>
			</FloatingLayerRoot>
		);
	}

	return <FloatingLayerRoot {...props} />;
}

export { FloatingLayer, FloatingLayerContent, FloatingLayerRoot, FloatingLayerTrigger };
