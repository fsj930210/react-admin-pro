"use client";
// 鏂囨。鍦板潃 https://www.diceui.com/docs/components/radix/rating
import {
  createContext,
  use,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type ComponentRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Star } from "lucide-react";
import { Direction as DirectionPrimitive, Slot as SlotPrimitive } from "radix-ui";
import { useComposedRefs } from "@rap/utils/compose-refs";
import { cn } from "@rap/utils";
import { VisuallyHiddenInput } from "./visually-hidden-input";
import { useAsRef } from "@rap/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@rap/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@rap/hooks/use-lazy-ref";
import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";

type Direction = "ltr" | "rtl";
type Orientation = "horizontal" | "vertical";
type ActivationMode = "automatic" | "manual";
type Size = "default" | "sm" | "lg";
type Step = 0.5 | 1;
type DataState = "full" | "partial" | "empty";
type FocusIntent = "first" | "last" | "prev" | "next";

type RootElement = ComponentRef<typeof Rating>;
type ItemElement = ComponentRef<typeof RatingItem>;

const ROOT_NAME = "Rating";
const ITEM_NAME = "RatingItem";

const ENTRY_FOCUS = "ratingFocusGroup.onEntryFocus";
const EVENT_OPTIONS = { bubbles: false, cancelable: true };

function getItemId(id: string, value: number) {
  return `${id}-item-${value}`;
}

function getPartialFillGradientId(id: string, step: Step) {
  return `partial-fill-gradient-${id}-${step}`;
}

const MAP_KEY_TO_FOCUS_INTENT: Record<string, FocusIntent> = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  Home: "first",
  End: "last",
};

function getDirectionAwareKey(key: string, dir?: Direction) {
  if (dir !== "rtl") return key;
  return key === "ArrowLeft" ? "ArrowRight" : key === "ArrowRight" ? "ArrowLeft" : key;
}

function getFocusIntent(
  event: KeyboardEvent<ItemElement>,
  dir?: Direction,
  orientation?: Orientation
) {
  const key = getDirectionAwareKey(event.key, dir);
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key)) return undefined;
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key)) return undefined;
  return MAP_KEY_TO_FOCUS_INTENT[key];
}

function focusFirst(candidates: RefObject<ItemElement | null>[], preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidateRef of candidates) {
    const candidate = candidateRef.current;
    if (!candidate) continue;
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}

interface StoreState {
  value: number;
  hoveredValue: number | null;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
}

const StoreContext = createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = use(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useStore<T>(selector: (state: StoreState) => T, ogStore?: Store | null): T {
  const contextStore = use(StoreContext);

  const store = ogStore ?? contextStore;

  if (!store) {
    throw new Error(`\`useStore\` must be used within \`${ROOT_NAME}\``);
  }

  const getSnapshot = useMemoizedFn(() => selector(store.getState()));

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface ItemData {
  id: string;
  ref: RefObject<ItemElement | null>;
  value: number;
  disabled: boolean;
}

interface RatingContextValue {
  rootId: string;
  dir: Direction;
  orientation: Orientation;
  activationMode: ActivationMode;
  size: Size;
  max: number;
  step: Step;
  clearable: boolean;
  disabled: boolean;
  readOnly: boolean;
  getAutoIndex: (instanceId: string) => number;
}

const RatingContext = createContext<RatingContextValue | null>(null);

function useRatingContext(consumerName: string) {
  const context = use(RatingContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface FocusContextValue {
  tabStopId: string | null;
  onItemFocus: (tabStopId: string) => void;
  onItemShiftTab: () => void;
  onFocusableItemAdd: () => void;
  onFocusableItemRemove: () => void;
  onItemRegister: (item: ItemData) => void;
  onItemUnregister: (id: string) => void;
  getItems: () => ItemData[];
}

const FocusContext = createContext<FocusContextValue | null>(null);

function useFocusContext(consumerName: string) {
  const context = use(FocusContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`FocusProvider\``);
  }
  return context;
}

interface RatingProps extends ComponentProps<"div"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onHover?: (value: number | null) => void;
  max?: number;
  activationMode?: ActivationMode;
  dir?: Direction;
  orientation?: Orientation;
  size?: Size;
  asChild?: boolean;
  step?: Step;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
}

function Rating(props: RatingProps) {
  const {
    value: valueProp,
    defaultValue = 0,
    onValueChange,
    onHover,
    onFocus: onFocusProp,
    onMouseDown: onMouseDownProp,
    dir: dirProp,
    orientation = "horizontal",
    activationMode = "automatic",
    size = "default",
    max = 5,
    step = 1,
    clearable = false,
    asChild,
    disabled = false,
    readOnly = false,
    required = false,
    className,
    id,
    name,
    ref,
    ...rootProps
  } = props;

  const dir = DirectionPrimitive.useDirection(dirProp);
  const instanceId = useId();
  const rootId = id ?? instanceId;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    value: valueProp ?? defaultValue,
    hoveredValue: null,
  }));

  const propsRef = useAsRef({
    onValueChange,
    onHover,
    onFocus: onFocusProp,
    onMouseDown: onMouseDownProp,
    step,
  });

  const store = useMemo<Store>(() => {
    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;

        if (key === "value" && typeof value === "number") {
          stateRef.current.value = value;
          propsRef.current.onValueChange?.(value);
        } else if (key === "hoveredValue") {
          stateRef.current.hoveredValue = value as number | null;
          propsRef.current.onHover?.(value as number | null);
        } else {
          stateRef.current[key] = value;
        }

        store.notify();
      },
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
    };
  }, [listenersRef, stateRef, propsRef]);

  useIsomorphicLayoutEffect(() => {
    if (valueProp !== undefined) {
      store.setState("value", valueProp);
    }
  }, [valueProp]);

  const value = useStore((state) => state.value, store);

  const [formTrigger, setFormTrigger] = useState<RootElement | null>(null);
  const composedRef = useComposedRefs(ref, (node) => setFormTrigger(node));
  const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

  const [tabStopId, setTabStopId] = useState<string | null>(null);
  const [isTabbingBackOut, setIsTabbingBackOut] = useState(false);
  const [focusableItemCount, setFocusableItemCount] = useState(0);
  const isClickFocusRef = useRef(false);
  const itemsRef = useRef<Map<string, ItemData>>(new Map());

  const autoIndexMapRef = useRef(new Map<string, number>());
  const nextAutoIndexRef = useRef(0);

  const getAutoIndex = useMemoizedFn((instanceId: string) => {
    const existingIndex = autoIndexMapRef.current.get(instanceId);
    if (existingIndex !== undefined) {
      return existingIndex;
    }

    const newIndex = nextAutoIndexRef.current++;
    autoIndexMapRef.current.set(instanceId, newIndex);
    return newIndex;
  });

  const onItemFocus = useMemoizedFn((tabStopId: string) => {
    setTabStopId(tabStopId);
  });

  const onItemShiftTab = useMemoizedFn(() => {
    setIsTabbingBackOut(true);
  });

  const onFocusableItemAdd = useMemoizedFn(() => {
    setFocusableItemCount((prevCount) => prevCount + 1);
  });

  const onFocusableItemRemove = useMemoizedFn(() => {
    setFocusableItemCount((prevCount) => prevCount - 1);
  });

  const onItemRegister = useMemoizedFn((item: ItemData) => {
    itemsRef.current.set(item.id, item);
  });

  const onItemUnregister = useMemoizedFn((id: string) => {
    itemsRef.current.delete(id);
  });

  const getItems = useMemoizedFn(() => {
    return Array.from(itemsRef.current.values())
      .filter((item) => item.ref.current)
      .sort((a, b) => {
        const elementA = a.ref.current;
        const elementB = b.ref.current;
        if (!elementA || !elementB) return 0;
        const position = elementA.compareDocumentPosition(elementB);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
          return -1;
        }
        if (position & Node.DOCUMENT_POSITION_PRECEDING) {
          return 1;
        }
        return 0;
      });
  });

  const onBlur = useMemoizedFn((event: FocusEvent<HTMLDivElement>) => {
    rootProps.onBlur?.(event);
    if (event.defaultPrevented) return;

    setIsTabbingBackOut(false);
  });

  const onFocus = useMemoizedFn((event: FocusEvent<HTMLDivElement>) => {
    propsRef.current.onFocus?.(event);
    if (event.defaultPrevented) return;

    const isKeyboardFocus = !isClickFocusRef.current;
    if (event.target === event.currentTarget && isKeyboardFocus && !isTabbingBackOut) {
      const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
      event.currentTarget.dispatchEvent(entryFocusEvent);

      if (!entryFocusEvent.defaultPrevented) {
        const items = Array.from(itemsRef.current.values()).filter((item) => !item.disabled);
        // For half-step ratings, find the item that represents the selected value
        // by looking for the ceiling value (e.g., 3.5 鈫?find item with value 4)
        const selectedItem =
          propsRef.current.step < 1
            ? items.find((item) => item.value === Math.ceil(value))
            : items.find((item) => item.value === value);
        const currentItem = items.find((item) => item.id === tabStopId);

        const candidateItems = [selectedItem, currentItem, ...items].filter(Boolean) as ItemData[];
        const candidateRefs = candidateItems.map((item) => item.ref);
        focusFirst(candidateRefs, false);
      }
    }
    isClickFocusRef.current = false;
  });

  const onMouseDown = useMemoizedFn((event: MouseEvent<HTMLDivElement>) => {
    propsRef.current.onMouseDown?.(event);

    if (event.defaultPrevented) return;

    isClickFocusRef.current = true;
  });

  const contextValue = useMemo<RatingContextValue>(
    () => ({
      rootId,
      dir,
      orientation,
      activationMode,
      disabled,
      readOnly,
      size,
      max,
      step,
      clearable,
      getAutoIndex,
    }),
    [
      rootId,
      dir,
      orientation,
      activationMode,
      disabled,
      readOnly,
      size,
      max,
      step,
      clearable,
      getAutoIndex,
    ]
  );

  const focusContextValue = useMemo<FocusContextValue>(
    () => ({
      tabStopId,
      onItemFocus,
      onItemShiftTab,
      onFocusableItemAdd,
      onFocusableItemRemove,
      onItemRegister,
      onItemUnregister,
      getItems,
    }),
    [
      tabStopId,
      onItemFocus,
      onItemShiftTab,
      onFocusableItemAdd,
      onFocusableItemRemove,
      onItemRegister,
      onItemUnregister,
      getItems,
    ]
  );

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <StoreContext value={store}>
      <RatingContext value={contextValue}>
        <FocusContext value={focusContextValue}>
          <RootPrimitive
            id={rootId}
            role="radiogroup"
            aria-orientation={orientation}
            data-disabled={disabled ? "" : undefined}
            data-readonly={readOnly ? "" : undefined}
            data-orientation={orientation}
            data-slot="rating"
            dir={dir}
            tabIndex={isTabbingBackOut || focusableItemCount === 0 ? -1 : 0}
            {...rootProps}
            ref={composedRef}
            className={cn(
              "flex gap-1 text-primary outline-none",
              orientation === "horizontal" ? "flex-row items-center" : "flex-col items-start",
              className
            )}
            onBlur={onBlur}
            onFocus={onFocus}
            onMouseDown={onMouseDown}
          />
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              <linearGradient id={getPartialFillGradientId(rootId, step)}>
                {dir === "rtl" ? (
                  <>
                    <stop offset="50%" stopColor="transparent" />
                    <stop offset="50%" stopColor="currentColor" />
                  </>
                ) : (
                  <>
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </>
                )}
              </linearGradient>
            </defs>
          </svg>
          {isFormControl && (
            <VisuallyHiddenInput
              type="hidden"
              control={formTrigger}
              name={name}
              value={value}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
            />
          )}
        </FocusContext>
      </RatingContext>
    </StoreContext>
  );
}

interface RatingItemProps extends Omit<ComponentProps<"button">, "children"> {
  index?: number;
  asChild?: boolean;
  children?: ReactNode | ((dataState: DataState) => ReactNode);
}

function RatingItem(props: RatingItemProps) {
  const {
    index,
    asChild,
    onClick: onClickProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    onMouseDown: onMouseDownProp,
    onMouseEnter: onMouseEnterProp,
    onMouseMove: onMouseMoveProp,
    onMouseLeave: onMouseLeaveProp,
    disabled,
    className,
    children,
    ref,
    ...itemProps
  } = props;

  const itemRef = useRef<ItemElement>(null);
  const composedRef = useComposedRefs(ref, itemRef);

  const context = useRatingContext(ITEM_NAME);

  const instanceId = useId();

  // useMemo resolves auto index once per registered item identity unless an explicit index is provided.
  const actualIndex = useMemo(() => {
    if (index !== undefined) {
      return index;
    }

    return context.getAutoIndex(instanceId);
  }, [index, context, instanceId]);

  const itemValue = actualIndex + 1;
  const store = useStoreContext(ITEM_NAME);
  const focusContext = useFocusContext(ITEM_NAME);
  const value = useStore((state) => state.value);
  const hoveredValue = useStore((state) => state.hoveredValue);
  const clearable = context.clearable;
  const step = context.step;
  const activationMode = context.activationMode;

  const itemId = getItemId(context.rootId, itemValue);
  const isDisabled = context.disabled || disabled;
  const isReadOnly = context.readOnly;
  const isTabStop = focusContext.tabStopId === itemId;

  const displayValue = hoveredValue ?? value;
  const isFilled = displayValue >= itemValue;
  const isPartiallyFilled =
    step < 1 && displayValue >= itemValue - step && displayValue < itemValue;
  const isHovered = hoveredValue !== null && hoveredValue < itemValue;

  const isMouseClickRef = useRef(false);

  const propsRef = useAsRef({
    onClick: onClickProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    onMouseDown: onMouseDownProp,
    onMouseEnter: onMouseEnterProp,
    onMouseMove: onMouseMoveProp,
    onMouseLeave: onMouseLeaveProp,
  });

  useIsomorphicLayoutEffect(() => {
    focusContext.onItemRegister({
      id: itemId,
      ref: itemRef,
      value: itemValue,
      disabled: !!isDisabled,
    });

    if (!isDisabled) {
      focusContext.onFocusableItemAdd();
    }

    return () => {
      focusContext.onItemUnregister(itemId);
      if (!isDisabled) {
        focusContext.onFocusableItemRemove();
      }
    };
  }, [focusContext, itemId, itemValue, isDisabled]);

  const onClick = useMemoizedFn((event: MouseEvent<ItemElement>) => {
    propsRef.current.onClick?.(event);
    if (event.defaultPrevented) return;

    if (!isDisabled && !isReadOnly) {
      let newValue = itemValue;

      if (step < 1) {
        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const isLeftHalf = clickX < rect.width / 2;

        if (context.dir === "rtl") {
          if (!isLeftHalf) {
            newValue = itemValue - step;
          }
        } else {
          if (isLeftHalf) {
            newValue = itemValue - step;
          }
        }
      }

      if (clearable && value === newValue) {
        newValue = 0;
      }

      store.setState("value", newValue);
    }
  });

  const onFocus = useMemoizedFn((event: FocusEvent<ItemElement>) => {
    propsRef.current.onFocus?.(event);
    if (event.defaultPrevented) return;

    focusContext.onItemFocus(itemId);

    const isKeyboardFocus = !isMouseClickRef.current;

    if (!isDisabled && !isReadOnly && activationMode !== "manual" && isKeyboardFocus) {
      // For half-step mode, check if the current value is a half-step that belongs to this item.
      const isHalfStepValue = step < 1 && value === itemValue - step;

      if (!isHalfStepValue) {
        const newValue = clearable && value === itemValue ? 0 : itemValue;
        store.setState("value", newValue);
      }
    }

    isMouseClickRef.current = false;
  });

  const onKeyDown = useMemoizedFn((event: KeyboardEvent<ItemElement>) => {
    propsRef.current.onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if ((event.key === "Enter" || event.key === " ") && activationMode === "manual") {
      event.preventDefault();
      if (!isDisabled && !isReadOnly && itemRef.current) {
        itemRef.current.click();
      }
      return;
    }

    if (event.key === "Tab" && event.shiftKey) {
      focusContext.onItemShiftTab();
      return;
    }

    if (event.target !== event.currentTarget) return;

    const focusIntent = getFocusIntent(event, context.dir, context.orientation);

    if (focusIntent !== undefined) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      event.preventDefault();

      // Half-step mode changes value by the configured step instead of jumping between whole items.
      if (step < 1 && (focusIntent === "prev" || focusIntent === "next")) {
        if (!isDisabled && !isReadOnly) {
          let newValue = value;

          if (focusIntent === "next") {
            newValue = Math.min(value + step, context.max);
          } else {
            newValue = Math.max(value - step, 0);
          }

          store.setState("value", newValue);

          const items = focusContext.getItems().filter((item) => !item.disabled);
          const targetItem = items.find((item) => item.value === Math.ceil(newValue));
          if (targetItem?.ref.current) {
            queueMicrotask(() => targetItem.ref.current?.focus());
          }
        }
        return;
      }

      const items = focusContext.getItems().filter((item) => !item.disabled);
      let candidateRefs = items.map((item) => item.ref);

      if (focusIntent === "last") {
        candidateRefs.reverse();
      } else if (focusIntent === "prev" || focusIntent === "next") {
        if (focusIntent === "prev") candidateRefs.reverse();
        const currentIndex = candidateRefs.findIndex((ref) => ref.current === event.currentTarget);
        candidateRefs = candidateRefs.slice(currentIndex + 1);
      }

      queueMicrotask(() => focusFirst(candidateRefs));
    }
  });

  const onMouseDown = useMemoizedFn((event: MouseEvent<ItemElement>) => {
    propsRef.current.onMouseDown?.(event);
    if (event.defaultPrevented) return;

    isMouseClickRef.current = true;

    if (isDisabled) {
      event.preventDefault();
    } else {
      focusContext.onItemFocus(itemId);
    }
  });

  const onMouseEnter = useMemoizedFn((event: MouseEvent<ItemElement>) => {
    propsRef.current.onMouseEnter?.(event);
    if (event.defaultPrevented) return;

    if (!isDisabled && !isReadOnly) {
      let hoverValue = itemValue;

      if (step < 1) {
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const isLeftHalf = mouseX < rect.width / 2;

        if (context.dir === "rtl") {
          if (!isLeftHalf) {
            hoverValue = itemValue - step;
          }
        } else {
          if (isLeftHalf) {
            hoverValue = itemValue - step;
          }
        }
      }

      store.setState("hoveredValue", hoverValue);
    }
  });

  const onMouseLeave = useMemoizedFn((event: MouseEvent<ItemElement>) => {
    propsRef.current.onMouseLeave?.(event);
    if (event.defaultPrevented) return;

    if (!isDisabled && !isReadOnly) {
      store.setState("hoveredValue", null);
    }
  });

  const onMouseMove = useMemoizedFn((event: MouseEvent<ItemElement>) => {
    propsRef.current.onMouseMove?.(event);
    if (event.defaultPrevented) return;

    if (!isDisabled && !isReadOnly && step < 1) {
      const rect = event.currentTarget.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const isLeftHalf = mouseX < rect.width / 2;

      let hoverValue = itemValue;
      if (context.dir === "rtl") {
        hoverValue = !isLeftHalf ? itemValue - step : itemValue;
      } else {
        hoverValue = isLeftHalf ? itemValue - step : itemValue;
      }

      store.setState("hoveredValue", hoverValue);
    }
  });

  const dataState: DataState = isFilled ? "full" : isPartiallyFilled ? "partial" : "empty";

  const ItemPrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <ItemPrimitive
      role="radio"
      type="button"
      id={itemId}
      aria-checked={isFilled}
      aria-posinset={itemValue}
      aria-setsize={context.max}
      data-disabled={isDisabled ? "" : undefined}
      data-readonly={isReadOnly ? "" : undefined}
      data-state={isFilled ? "full" : isPartiallyFilled ? "partial" : "empty"}
      data-hovered={isHovered ? "" : undefined}
      data-slot="rating-item"
      disabled={isDisabled}
      tabIndex={isTabStop ? 0 : -1}
      {...itemProps}
      ref={composedRef}
      style={{
        ...itemProps.style,
        ...(isPartiallyFilled && {
          "--partial-fill": `url(#${getPartialFillGradientId(context.rootId, step)})`,
        }),
      }}
      className={cn(
        "inline-flex items-center justify-center rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        "[&_svg:not([class*='size-'])]:size-full [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-colors [&_svg]:duration-200 data-[state=empty]:[&_svg]:fill-transparent data-[state=full]:[&_svg]:fill-current data-[state=partial]:[&_svg]:fill-(--partial-fill)",
        context.size === "sm" ? "size-4" : context.size === "lg" ? "size-6" : "size-5",
        className
      )}
      onClick={onClick}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {typeof children === "function" ? children(dataState) : (children ?? <Star />)}
    </ItemPrimitive>
  );
}

export {
  Rating,
  RatingItem,
  //
  useStore as useRating,
};
