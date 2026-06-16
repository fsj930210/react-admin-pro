"use client";

import {
  ActivationConstraint,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/abstract";
import * as React from "react";
import {
  createContext,
  use,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { RestrictToHorizontalAxis, RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { arrayMove } from "@dnd-kit/helpers";
import { DragDropProvider, DragOverlay, PointerSensor } from "@dnd-kit/react";
import { type UseSortableInput, useSortable } from "@dnd-kit/react/sortable";
import { cn } from "@rap/utils";
import { useComposedRefs } from "@rap/utils/compose-refs";
import { Slot as SlotPrimitive } from "radix-ui";
import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";

type SortableId = UniqueIdentifier;
type DragDropProviderProps = React.ComponentProps<typeof DragDropProvider>;
type SortableOrientation = "horizontal" | "vertical" | "mixed";
type SortableType = NonNullable<UseSortableInput["type"]>;
type SortableAccept = UseSortableInput["accept"];

interface SortableReorderEvent extends DragEndEvent {
  sourceId: SortableId;
  targetId: SortableId;
  sourceIndex: number;
  targetIndex: number;
  nextItems: SortableId[];
}

type SortableRootProps = Omit<
  DragDropProviderProps,
  "modifiers" | "sensors" | "onDragStart" | "onDragMove" | "onDragOver" | "onDragEnd"
> & {
  items: SortableId[];
  onItemsChange?: (items: SortableId[]) => void;
  onReorder?: (event: SortableReorderEvent) => false | void;
  orientation?: SortableOrientation;
  activationDistance?: number;
  flatCursor?: boolean;
  modifiers?: DragDropProviderProps["modifiers"];
  sensors?: DragDropProviderProps["sensors"];
  onDragStart?: (event: DragStartEvent) => void;
  onDragMove?: (event: DragMoveEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  children?: ReactNode;
};

interface SortableContextValue {
  items: SortableId[];
  activeId: SortableId | null;
  flatCursor: boolean;
}

interface SortableItemContextValue {
  controlId: string;
  disabled?: boolean;
  isDragging?: boolean;
  handleRef: (element: Element | null) => void;
}

class DistanceActivationConstraint extends ActivationConstraint<PointerEvent, { value: number }> {
  private origin?: { x: number; y: number };

  onEvent(event: PointerEvent) {
    switch (event.type) {
      case "pointerdown":
        this.origin = { x: event.clientX, y: event.clientY };
        break;
      case "pointermove": {
        if (!this.origin) return;

        const distance = Math.hypot(event.clientX - this.origin.x, event.clientY - this.origin.y);
        if (distance >= this.options.value) {
          this.activate(event);
        }
        break;
      }
      case "pointerup":
        this.abort();
        break;
    }
  }

  abort() {
    this.origin = undefined;
  }
}

const orientationModifiers: Record<SortableOrientation, DragDropProviderProps["modifiers"]> = {
  horizontal: [RestrictToHorizontalAxis],
  vertical: [RestrictToVerticalAxis],
  mixed: undefined,
};

const SortableRootContext = createContext<SortableContextValue | null>(null);
const SortableItemContext = createContext<SortableItemContextValue | null>(null);

function useSortableRoot(component: string) {
  const context = use(SortableRootContext);
  if (!context) {
    throw new Error(`\`${component}\` must be rendered inside \`Sortable.Root\``);
  }
  return context;
}

function useSortableItem(component: string) {
  const context = use(SortableItemContext);
  if (!context) {
    throw new Error(`\`${component}\` must be rendered inside \`Sortable.Item\``);
  }
  return context;
}

function Root(props: SortableRootProps) {
  const {
    items,
    onItemsChange,
    onReorder,
    orientation = "vertical",
    activationDistance,
    flatCursor = false,
    modifiers,
    sensors,
    onDragStart: onDragStartProp,
    onDragMove,
    onDragOver,
    onDragEnd: onDragEndProp,
    children,
    ...providerProps
  } = props;

  const [activeId, setActiveId] = useState<SortableId | null>(null);
  const resolvedModifiers = modifiers ?? orientationModifiers[orientation];
  const resolvedSensors = useMemo(() => {
    if (sensors || activationDistance == null) return sensors;

    return [
      PointerSensor.configure({
        activationConstraints: [new DistanceActivationConstraint({ value: activationDistance })],
      }),
    ] satisfies DragDropProviderProps["sensors"];
  }, [sensors, activationDistance]);

  const handleDragStart = useMemoizedFn((event: DragStartEvent) => {
    onDragStartProp?.(event);
    setActiveId(event.operation.source?.id ?? null);
  });

  const handleDragEnd = useMemoizedFn((event: DragEndEvent) => {
    onDragEndProp?.(event);

    const sourceId = event.operation.source?.id;
    const targetId = event.operation.target?.id;
    if (!event.canceled && sourceId != null && targetId != null && sourceId !== targetId) {
      const sourceIndex = items.indexOf(sourceId);
      const targetIndex = items.indexOf(targetId);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        const nextItems = arrayMove(items, sourceIndex, targetIndex) as SortableId[];
        const reorderResult = onReorder?.({
          ...event,
          sourceId,
          targetId,
          sourceIndex,
          targetIndex,
          nextItems,
        });

        if (reorderResult !== false) {
          onItemsChange?.(nextItems);
        }
      }
    }

    setActiveId(null);
  });

  const contextValue = useMemo<SortableContextValue>(
    () => ({ items, activeId, flatCursor }),
    [items, activeId, flatCursor]
  );

  return (
    <SortableRootContext value={contextValue}>
      <DragDropProvider
        modifiers={resolvedModifiers}
        sensors={resolvedSensors}
        onDragStart={handleDragStart}
        onDragMove={onDragMove}
        onDragOver={onDragOver}
        onDragEnd={handleDragEnd}
        {...providerProps}
      >
        {children}
      </DragDropProvider>
    </SortableRootContext>
  );
}

interface SortableListProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

function List(props: SortableListProps) {
  const { asChild, ref, ...listProps } = props;
  useSortableRoot("Sortable.List");

  const Primitive = asChild ? SlotPrimitive.Slot : "div";

  return <Primitive data-slot="sortable-list" {...listProps} ref={ref} />;
}

interface SortableItemProps
  extends
    Omit<ComponentProps<"div">, "data" | "id">,
    Pick<
      UseSortableInput,
      | "accept"
      | "alignment"
      | "collisionDetector"
      | "collisionPriority"
      | "data"
      | "group"
      | "modifiers"
      | "plugins"
      | "sensors"
      | "transition"
      | "type"
    > {
  id: SortableId;
  index?: number;
  asChild?: boolean;
  disabled?: boolean;
  handle?: boolean;
}

function Item(props: SortableItemProps) {
  const {
    id,
    index: indexProp,
    asChild,
    disabled,
    handle,
    className,
    ref,
    accept,
    alignment,
    collisionDetector,
    collisionPriority,
    data,
    group,
    modifiers,
    plugins,
    sensors,
    transition,
    type,
    ...itemProps
  } = props;

  const root = useSortableRoot("Sortable.Item");
  const controlId = useId();
  const index = indexProp ?? root.items.indexOf(id);
  const {
    handleRef,
    ref: sortableRef,
    sourceRef,
    targetRef,
    isDragging,
  } = useSortable({
    id,
    index: Math.max(index, 0),
    accept,
    alignment,
    collisionDetector,
    collisionPriority,
    data,
    disabled,
    group,
    modifiers,
    plugins,
    sensors,
    transition,
    type,
  });

  const composedRef = useComposedRefs(ref, (node) => {
    if (disabled) return;
    sortableRef(node);
    sourceRef(node);
    targetRef(node);
    if (handle) handleRef(node);
  });

  const contextValue = useMemo<SortableItemContextValue>(
    () => ({ controlId, disabled, isDragging, handleRef }),
    [controlId, disabled, isDragging, handleRef]
  );
  const Primitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <SortableItemContext value={contextValue}>
      <Primitive
        id={controlId}
        data-disabled={disabled}
        data-dragging={isDragging ? "" : undefined}
        data-slot="sortable-item"
        {...itemProps}
        ref={composedRef}
        className={cn(
          "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
          {
            "touch-none select-none": handle,
            "cursor-default": root.flatCursor,
            "cursor-grab": handle && !isDragging && !root.flatCursor,
            "data-dragging:cursor-grabbing": !root.flatCursor,
            "opacity-50": isDragging,
          },
          className
        )}
      />
    </SortableItemContext>
  );
}

interface SortableHandleProps extends ComponentProps<"button"> {
  asChild?: boolean;
}

function Handle(props: SortableHandleProps) {
  const { asChild, disabled, className, ref, ...handleProps } = props;
  const root = useSortableRoot("Sortable.Handle");
  const item = useSortableItem("Sortable.Handle");
  const isDisabled = disabled ?? item.disabled;
  const composedRef = useComposedRefs(ref, (node) => {
    if (isDisabled) return;
    item.handleRef(node);
  });
  const Primitive = asChild ? SlotPrimitive.Slot : "button";
  const primitiveProps = asChild ? handleProps : { type: "button" as const, ...handleProps };

  return (
    <Primitive
      aria-controls={item.controlId}
      data-disabled={isDisabled}
      data-dragging={item.isDragging ? "" : undefined}
      data-slot="sortable-handle"
      {...primitiveProps}
      ref={composedRef}
      className={cn(
        "select-none disabled:pointer-events-none disabled:opacity-50",
        root.flatCursor ? "cursor-default" : "cursor-grab data-dragging:cursor-grabbing",
        className
      )}
      disabled={isDisabled}
    />
  );
}

interface SortableOverlayProps extends Omit<ComponentProps<typeof DragOverlay>, "children"> {
  children?: ((params: { id: SortableId }) => ReactNode) | ReactNode;
}

function Overlay(props: SortableOverlayProps) {
  const { children, ...overlayProps } = props;
  const root = useSortableRoot("Sortable.Overlay");

  return (
    <DragOverlay
      dropAnimation={null}
      className={cn(!root.flatCursor && "cursor-grabbing")}
      {...overlayProps}
    >
      {root.activeId
        ? typeof children === "function"
          ? children({ id: root.activeId })
          : children
        : null}
    </DragOverlay>
  );
}

const Sortable = {
  Root,
  List,
  Item,
  Handle,
  Overlay,
};

export {
  Sortable,
  type SortableAccept,
  type SortableId,
  type SortableOrientation,
  type SortableReorderEvent,
  type SortableRootProps,
  type SortableType,
};
