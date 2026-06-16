"use client";
// 鏂囨。鍦板潃 https://www.diceui.com/docs/components/radix/time-picker
import {
  createContext,
  use,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ChangeEvent,
  type ComponentProps,
  type ComponentRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { Clock } from "lucide-react";
import { Slot as SlotPrimitive } from "radix-ui";
import dayjs from "dayjs";
import { useComposedRefs } from "@rap/utils/compose-refs";
import { cn } from "@rap/utils";
import { VisuallyHiddenInput } from "./visually-hidden-input";
import { useAsRef } from "@rap/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@rap/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@rap/hooks/use-lazy-ref";
import { Button } from "./button";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";
import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";

const ROOT_NAME = "TimePicker";
const LABEL_NAME = "TimePickerLabel";
const INPUT_GROUP_NAME = "TimePickerInputGroup";
const INPUT_NAME = "TimePickerInput";
const TRIGGER_NAME = "TimePickerTrigger";
const CONTENT_NAME = "TimePickerContent";
const COLUMN_NAME = "TimePickerColumn";
const COLUMN_ITEM_NAME = "TimePickerColumnItem";
const HOUR_NAME = "TimePickerHour";
const MINUTE_NAME = "TimePickerMinute";
const SECOND_NAME = "TimePickerSecond";
const PERIOD_NAME = "TimePickerPeriod";
const CLEAR_NAME = "TimePickerClear";

const DEFAULT_STEP = 1;
const DEFAULT_SEGMENT_PLACEHOLDER = "--";
const DEFAULT_LOCALE = undefined;
const SEGMENTS: Segment[] = ["hour", "minute", "second", "period"];
const PERIODS = ["AM", "PM"] as const;

type Segment = "hour" | "minute" | "second" | "period";
type SegmentFormat = "numeric" | "2-digit";
type Period = (typeof PERIODS)[number];

interface DivProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

interface ButtonProps extends ComponentProps<"button"> {
  asChild?: boolean;
}

type PopoverContentProps = ComponentProps<typeof PopoverContent>;

type InputGroupElement = ComponentRef<typeof TimePickerInputGroup>;
type InputElement = ComponentRef<typeof TimePickerInput>;
type TriggerElement = ComponentRef<typeof TimePickerTrigger>;
type ColumnElement = ComponentRef<typeof TimePickerColumn>;
type ColumnItemElement = ComponentRef<typeof TimePickerColumnItem>;

interface TimeValue {
  hour?: number;
  minute?: number;
  second?: number;
  period?: Period;
}

interface ItemData {
  value: number | string;
  ref: RefObject<ColumnItemElement | null>;
  selected: boolean;
}

interface ColumnData {
  id: string;
  ref: RefObject<ColumnElement | null>;
  getSelectedItemRef: () => RefObject<ColumnItemElement | null> | null;
  getItems: () => ItemData[];
}

function focusFirst(candidates: RefObject<ColumnItemElement | null>[], preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidateRef of candidates) {
    const candidate = candidateRef.current;
    if (!candidate) continue;
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}

function sortNodes<T extends { ref: RefObject<Element | null> }>(items: T[]): T[] {
  return items.sort((a, b) => {
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
}

function getIs12Hour(locale?: string): boolean {
  const testDate = new Date(2000, 0, 1, 13, 0, 0);
  const formatted = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
  }).format(testDate);

  return /am|pm/i.test(formatted) || !formatted.includes("13");
}

function parseTimeString(timeString: string | undefined): TimeValue | null {
  if (!timeString) return null;

  const parts = timeString.split(":");
  if (parts.length < 2) return null;

  const result: TimeValue = {};

  if (parts[0] && parts[0] !== DEFAULT_SEGMENT_PLACEHOLDER) {
    const hour = Number.parseInt(parts[0], 10);
    if (!Number.isNaN(hour) && hour >= 0 && hour <= 23) {
      result.hour = hour;
    }
  }

  if (parts[1] && parts[1] !== DEFAULT_SEGMENT_PLACEHOLDER) {
    const minute = Number.parseInt(parts[1], 10);
    if (!Number.isNaN(minute) && minute >= 0 && minute <= 59) {
      result.minute = minute;
    }
  }

  if (parts[2] && parts[2] !== DEFAULT_SEGMENT_PLACEHOLDER) {
    const second = Number.parseInt(parts[2], 10);
    if (!Number.isNaN(second) && second >= 0 && second <= 59) {
      result.second = second;
    }
  }
  if (result.hour === undefined && result.minute === undefined && result.second === undefined) {
    return null;
  }

  return result;
}

function formatTimeValue(value: TimeValue, showSeconds: boolean): string {
  const hourStr =
    value.hour !== undefined ? value.hour.toString().padStart(2, "0") : DEFAULT_SEGMENT_PLACEHOLDER;
  const minuteStr =
    value.minute !== undefined
      ? value.minute.toString().padStart(2, "0")
      : DEFAULT_SEGMENT_PLACEHOLDER;
  const secondStr =
    value.second !== undefined
      ? value.second.toString().padStart(2, "0")
      : DEFAULT_SEGMENT_PLACEHOLDER;

  if (showSeconds) {
    return `${hourStr}:${minuteStr}:${secondStr}`;
  }
  return `${hourStr}:${minuteStr}`;
}

function formatPickerValue(value: TimePickerValue | undefined, showSeconds: boolean) {
  if (!value) return "";
  return typeof value === "string" ? value : value.format(showSeconds ? "HH:mm:ss" : "HH:mm");
}

function normalizeSegmentPlaceholder(segmentPlaceholder: SegmentPlaceholder) {
  if (typeof segmentPlaceholder === "string") {
    return {
      hour: segmentPlaceholder,
      minute: segmentPlaceholder,
      second: segmentPlaceholder,
      period: segmentPlaceholder,
    };
  }
  return {
    hour: segmentPlaceholder.hour ?? DEFAULT_SEGMENT_PLACEHOLDER,
    minute: segmentPlaceholder.minute ?? DEFAULT_SEGMENT_PLACEHOLDER,
    second: segmentPlaceholder.second ?? DEFAULT_SEGMENT_PLACEHOLDER,
    period: segmentPlaceholder.period ?? DEFAULT_SEGMENT_PLACEHOLDER,
  };
}

function to12Hour(hour24: number): { hour: number; period: Period } {
  const period: Period = hour24 >= 12 ? "PM" : "AM";
  const hour = hour24 % 12 || 12;
  return { hour, period };
}

function to24Hour(hour12: number, period: Period): number {
  if (hour12 === 12) {
    return period === "PM" ? 12 : 0;
  }
  return period === "PM" ? hour12 + 12 : hour12;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

interface StoreState {
  value: string;
  open: boolean;
  openedViaFocus: boolean;
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

type SegmentPlaceholder =
  | string
  | {
      hour?: string;
      minute?: string;
      second?: string;
      period?: string;
    };

interface TimePickerContextValue {
  id: string;
  inputGroupId: string;
  labelId: string;
  triggerId: string;
  inputGroupRef: RefObject<InputGroupElement | null>;
  triggerRef: RefObject<TriggerElement | null>;
  openOnFocus: boolean;
  inputGroupClickAction: "focus" | "open";
  onInputGroupChange: (inputGroup: InputGroupElement | null) => void;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  showSeconds: boolean;
  is12Hour: boolean;
  minuteStep: number;
  secondStep: number;
  hourStep: number;
  segmentPlaceholder: {
    hour: string;
    minute: string;
    second: string;
    period: string;
  };
  min?: string;
  max?: string;
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
  disabledPeriods?: () => Period[];
}

const TimePickerContext = createContext<TimePickerContextValue | null>(null);

function useTimePickerContext(consumerName: string) {
  const context = use(TimePickerContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

type TimePickerValue = string | dayjs.Dayjs;

interface TimePickerProps extends Omit<DivProps, "defaultValue"> {
  value?: TimePickerValue;
  defaultValue?: TimePickerValue;
  onValueChange?: (value: string, date: dayjs.Dayjs | null) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openOnFocus?: boolean;
  inputGroupClickAction?: "focus" | "open";
  min?: string;
  max?: string;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  segmentPlaceholder?: SegmentPlaceholder;
  locale?: string;
  format?: string;
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  required?: boolean;
  showSeconds?: boolean;
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
  disabledPeriods?: () => Period[];
}

function TimePicker(props: TimePickerProps) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    openOnFocus = false,
    inputGroupClickAction = "focus",
    min,
    max,
    hourStep = DEFAULT_STEP,
    minuteStep = DEFAULT_STEP,
    secondStep = DEFAULT_STEP,
    segmentPlaceholder = DEFAULT_SEGMENT_PLACEHOLDER,
    locale = DEFAULT_LOCALE,
    format = "HH:mm",
    name,
    asChild,
    disabled = false,
    invalid = false,
    readOnly = false,
    required = false,
    showSeconds,
    disabledHours,
    disabledMinutes,
    disabledSeconds,
    disabledPeriods,
    className,
    children,
    id,
    ...rootProps
  } = props;

  const instanceId = useId();
  const rootId = id ?? instanceId;
  const inputGroupId = useId();
  const labelId = useId();
  const triggerId = useId();

  const inputGroupRef = useRef<InputGroupElement>(null);
  const triggerRef = useRef<TriggerElement>(null);

  const [inputGroup, setInputGroup] = useState<InputGroupElement | null>(null);
  const isFormControl = inputGroup ? !!inputGroup.closest("form") : true;

  const formatHasSeconds = /s/.test(format);
  const mergedShowSeconds = showSeconds ?? formatHasSeconds;
  const formatTimePickerValue = useMemoizedFn((next: TimePickerValue | undefined) =>
    formatPickerValue(next, mergedShowSeconds)
  );

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    value: formatTimePickerValue(valueProp ?? defaultValue),
    open: open ?? defaultOpen ?? false,
    openedViaFocus: false,
  }));

  const propsRef = useAsRef({ onValueChange, onOpenChange });
  const storeRef = useLazyRef<Store>(() => ({
    subscribe: (cb) => {
      listenersRef.current.add(cb);
      return () => listenersRef.current.delete(cb);
    },
    getState: () => stateRef.current,
    setState: (key, value) => {
      if (Object.is(stateRef.current[key], value)) return;

      if (key === "value" && typeof value === "string") {
        stateRef.current.value = value;
        const parsed = parseTimeString(value);
        const nextDate =
          parsed && parsed.hour !== undefined && parsed.minute !== undefined
            ? dayjs()
                .hour(parsed.hour)
                .minute(parsed.minute)
                .second(parsed.second ?? 0)
                .millisecond(0)
            : null;
        propsRef.current.onValueChange?.(value, nextDate);
      } else if (key === "open" && typeof value === "boolean") {
        stateRef.current.open = value;
        propsRef.current.onOpenChange?.(value);
        if (!value) {
          stateRef.current.openedViaFocus = false;
        }
      } else {
        stateRef.current[key] = value;
      }

      storeRef.current.notify();
    },
    notify: () => {
      for (const cb of listenersRef.current) {
        cb();
      }
    },
  }));
  const store = storeRef.current;

  const value = useStore((state) => state.value, store);

  // Controlled value props must sync into the external store before paint.
  useIsomorphicLayoutEffect(() => {
    if (valueProp !== undefined) {
      store.setState("value", formatTimePickerValue(valueProp));
    }
  }, [valueProp, formatTimePickerValue]);

  // Controlled open props must sync into the external store before popover layout.
  useIsomorphicLayoutEffect(() => {
    if (open !== undefined) {
      store.setState("open", open);
    }
  }, [open]);

  const storeOpen = useStore((state) => state.open, store);

  const onPopoverOpenChange = useMemoizedFn((newOpen: boolean) => store.setState("open", newOpen));

  const is12Hour = getIs12Hour(locale);
  const normalizedPlaceholder = normalizeSegmentPlaceholder(segmentPlaceholder);
  const rootContext: TimePickerContextValue = {
    id: rootId,
    inputGroupId,
    labelId,
    triggerId,
    inputGroupRef,
    triggerRef,
    openOnFocus,
    inputGroupClickAction,
    onInputGroupChange: setInputGroup,
    disabled,
    readOnly,
    required,
    invalid,
    showSeconds: mergedShowSeconds,
    is12Hour,
    minuteStep,
    secondStep,
    hourStep,
    segmentPlaceholder: normalizedPlaceholder,
    min,
    max,
    disabledHours,
    disabledMinutes,
    disabledSeconds,
    disabledPeriods,
  };

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <>
      <StoreContext value={store}>
        <TimePickerContext value={rootContext}>
          <Popover open={storeOpen} onOpenChange={onPopoverOpenChange}>
            <RootPrimitive
              data-slot="time-picker"
              data-disabled={disabled ? "" : undefined}
              data-invalid={invalid ? "" : undefined}
              {...rootProps}
              className={cn("relative", className)}
            >
              {children}
            </RootPrimitive>
          </Popover>
        </TimePickerContext>
      </StoreContext>
      {isFormControl && (
        <VisuallyHiddenInput
          type="hidden"
          control={inputGroup}
          name={name}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
        />
      )}
    </>
  );
}

interface TimePickerLabelProps extends ComponentProps<"label"> {
  asChild?: boolean;
}

function TimePickerLabel(props: TimePickerLabelProps) {
  const { asChild, className, ...labelProps } = props;

  const { labelId } = useTimePickerContext(LABEL_NAME);

  const LabelPrimitive = asChild ? SlotPrimitive.Slot : "label";

  return (
    <LabelPrimitive
      data-slot="time-picker-label"
      {...labelProps}
      htmlFor={labelId}
      className={cn(
        "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
    />
  );
}

interface TimePickerInputGroupContextValue {
  onInputRegister: (segment: Segment, ref: RefObject<InputElement | null>) => void;
  onInputUnregister: (segment: Segment) => void;
  getNextInput: (currentSegment: Segment) => RefObject<InputElement | null> | null;
}

const TimePickerInputGroupContext = createContext<TimePickerInputGroupContextValue | null>(null);

function useTimePickerInputGroupContext(consumerName: string) {
  const context = use(TimePickerInputGroupContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${INPUT_GROUP_NAME}\``);
  }
  return context;
}

function TimePickerInputGroup(props: DivProps) {
  const {
    onPointerDown: onPointerDownProp,
    onClick: onClickProp,
    asChild,
    className,
    style,
    ref,
    ...inputGroupProps
  } = props;

  const {
    inputGroupId,
    labelId,
    onInputGroupChange,
    disabled,
    readOnly,
    invalid,
    segmentPlaceholder,
    inputGroupRef,
    triggerRef,
    inputGroupClickAction,
  } = useTimePickerContext(INPUT_GROUP_NAME);

  const store = useStoreContext(INPUT_GROUP_NAME);

  const composedRef = useComposedRefs(ref, inputGroupRef, onInputGroupChange);

  const inputRefsMap = useRef<Map<Segment, RefObject<InputElement | null>>>(new Map());

  const onInputRegister = useMemoizedFn((segment: Segment, ref: RefObject<InputElement | null>) => {
    inputRefsMap.current.set(segment, ref);
  });

  const onInputUnregister = useMemoizedFn((segment: Segment) => {
    inputRefsMap.current.delete(segment);
  });

  const getNextInput = useMemoizedFn(
    (currentSegment: Segment): RefObject<InputElement | null> | null => {
      const segmentOrder: Segment[] = ["hour", "minute", "second", "period"];
      const currentIndex = segmentOrder.indexOf(currentSegment);

      if (currentIndex === -1 || currentIndex === segmentOrder.length - 1) {
        return null;
      }

      for (let i = currentIndex + 1; i < segmentOrder.length; i++) {
        const nextSegment = segmentOrder[i];
        if (nextSegment) {
          const nextRef = inputRefsMap.current.get(nextSegment);
          if (nextRef?.current) {
            return nextRef;
          }
        }
      }

      return null;
    }
  );

  const onPointerDown = useMemoizedFn((event: PointerEvent<InputGroupElement>) => {
    onPointerDownProp?.(event);
    if (disabled || readOnly || event.defaultPrevented) return;

    const target = event.target as HTMLElement;

    if (target.tagName === "INPUT" || target.closest("input")) {
      return;
    }

    if (triggerRef.current?.contains(target)) {
      return;
    }

    event.preventDefault();
  });

  const onClick = useMemoizedFn((event: MouseEvent<InputGroupElement>) => {
    onClickProp?.(event);
    if (disabled || readOnly || event.defaultPrevented) return;

    const target = event.target as HTMLElement;

    if (target.tagName === "INPUT" || target.closest("input")) {
      return;
    }

    if (triggerRef.current?.contains(target)) {
      return;
    }

    if (inputGroupClickAction === "open") {
      store.setState("open", true);
    } else {
      const activeElement = document.activeElement;
      const isInputAlreadyFocused =
        activeElement &&
        activeElement.tagName === "INPUT" &&
        inputGroupRef.current?.contains(activeElement);

      if (!isInputAlreadyFocused) {
        for (const segment of SEGMENTS) {
          const inputRef = inputRefsMap.current.get(segment);
          if (inputRef?.current) {
            inputRef.current.focus();
            inputRef.current.select();
            break;
          }
        }
      }
    }
  });

  const inputGroupContextValue: TimePickerInputGroupContextValue = {
    onInputRegister,
    onInputUnregister,
    getNextInput,
  };

  const InputGroupPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <TimePickerInputGroupContext value={inputGroupContextValue}>
      <PopoverAnchor asChild>
        <InputGroupPrimitive
          role="group"
          id={inputGroupId}
          aria-labelledby={labelId}
          data-slot="time-picker-input-group"
          data-disabled={disabled ? "" : undefined}
          data-invalid={invalid ? "" : undefined}
          {...inputGroupProps}
          className={cn(
            "flex h-10 w-full cursor-text items-center gap-0.5 rounded-md border border-input bg-background px-3 py-2 shadow-xs outline-none transition-shadow",
            "has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50",
            invalid && "border-destructive ring-destructive/20",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          style={
            {
              "--time-picker-hour-input-width": `${segmentPlaceholder.hour.length}ch`,
              "--time-picker-minute-input-width": `${segmentPlaceholder.minute.length}ch`,
              "--time-picker-second-input-width": `${segmentPlaceholder.second.length}ch`,
              "--time-picker-period-input-width": `${Math.max(segmentPlaceholder.period.length, 2) + 0.5}ch`,
              ...style,
            } as CSSProperties
          }
          ref={composedRef}
          onPointerDown={onPointerDown}
          onClick={onClick}
        />
      </PopoverAnchor>
    </TimePickerInputGroupContext>
  );
}

interface TimePickerInputProps extends Omit<ComponentProps<"input">, "type" | "value"> {
  segment: Segment;
}

function TimePickerInput(props: TimePickerInputProps) {
  const {
    segment,
    onBlur: onBlurProp,
    onChange: onChangeProp,
    onClick: onClickProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    disabled: disabledProp,
    readOnly: readOnlyProp,
    className,
    style,
    ref,
    ...inputProps
  } = props;

  const { is12Hour, showSeconds, disabled, readOnly, segmentPlaceholder, openOnFocus } =
    useTimePickerContext(INPUT_NAME);
  const store = useStoreContext(INPUT_NAME);
  const inputGroupContext = useTimePickerInputGroupContext(INPUT_NAME);

  const isDisabled = disabledProp || disabled;
  const isReadOnly = readOnlyProp || readOnly;

  const value = useStore((state) => state.value);
  const timeValue = parseTimeString(value);

  const inputRef = useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(ref, inputRef);

  // Segment inputs register with the group so keyboard navigation can move across fields.
  useIsomorphicLayoutEffect(() => {
    if (segment) {
      inputGroupContext.onInputRegister(segment as Segment, inputRef);
      return () => inputGroupContext.onInputUnregister(segment as Segment);
    }
  }, [inputGroupContext, segment]);

  const getSegmentValue = useMemoizedFn(() => {
    if (!timeValue) {
      if (!segment) return "";
      return segmentPlaceholder[segment];
    }
    switch (segment) {
      case "hour": {
        if (timeValue.hour === undefined) return segmentPlaceholder.hour;
        if (is12Hour) {
          return to12Hour(timeValue.hour).hour.toString().padStart(2, "0");
        }
        return timeValue.hour.toString().padStart(2, "0");
      }
      case "minute":
        if (timeValue.minute === undefined) return segmentPlaceholder.minute;
        return timeValue.minute.toString().padStart(2, "0");
      case "second":
        if (timeValue.second === undefined) return segmentPlaceholder.second;
        return timeValue.second.toString().padStart(2, "0");
      case "period": {
        if (!timeValue || timeValue.hour === undefined) return segmentPlaceholder.period;
        return to12Hour(timeValue.hour).period;
      }
      default:
        return "";
    }
  });

  const [editValue, setEditValue] = useState(getSegmentValue());
  const [isEditing, setIsEditing] = useState(false);
  const [pendingDigit, setPendingDigit] = useState<string | null>(null);

  // When editing ends externally, clear transient input text and render the committed segment value.
  useEffect(() => {
    if (!isEditing) {
      setEditValue(getSegmentValue());
      setPendingDigit(null);
    }
  }, [getSegmentValue, isEditing]);

  const updateTimeValue = useMemoizedFn(
    (newSegmentValue: string | undefined, shouldCreateIfEmpty = false) => {
      const placeholder = segment ? segmentPlaceholder[segment] : DEFAULT_SEGMENT_PLACEHOLDER;
      if (!newSegmentValue || newSegmentValue === placeholder) return;
      if (!timeValue && !shouldCreateIfEmpty) return;

      const currentTime = timeValue ?? {};
      const newTime = { ...currentTime };

      switch (segment) {
        case "hour": {
          const displayHour = Number.parseInt(newSegmentValue, 10);
          if (!Number.isNaN(displayHour)) {
            if (is12Hour) {
              const clampedHour = clamp(displayHour, 1, 12);
              let currentPeriod: Period;
              if (timeValue?.period !== undefined) {
                currentPeriod = timeValue.period;
              } else if (timeValue?.hour !== undefined) {
                currentPeriod = to12Hour(timeValue.hour).period;
              } else {
                const now = new Date();
                currentPeriod = to12Hour(now.getHours()).period;
              }
              const hour24 = to24Hour(clampedHour, currentPeriod);
              newTime.hour = hour24;
              if (timeValue?.period !== undefined) {
                newTime.period = timeValue.period;
              }
            } else {
              newTime.hour = clamp(displayHour, 0, 23);
            }
          }
          break;
        }
        case "minute": {
          const minute = Number.parseInt(newSegmentValue, 10);
          if (!Number.isNaN(minute)) {
            newTime.minute = clamp(minute, 0, 59);
          }
          break;
        }
        case "second": {
          const second = Number.parseInt(newSegmentValue, 10);
          if (!Number.isNaN(second)) {
            newTime.second = clamp(second, 0, 59);
          }
          break;
        }
        case "period": {
          if (newSegmentValue === "AM" || newSegmentValue === "PM") {
            newTime.period = newSegmentValue;
            if (timeValue && timeValue.hour !== undefined) {
              const currentDisplay = to12Hour(timeValue.hour);
              newTime.hour = to24Hour(currentDisplay.hour, newSegmentValue);
            }
          }
          break;
        }
      }

      const newValue = formatTimeValue(newTime, showSeconds);
      store.setState("value", newValue);
    }
  );

  const onBlur = useMemoizedFn((event: FocusEvent<InputElement>) => {
    onBlurProp?.(event);
    if (event.defaultPrevented) return;

    setIsEditing(false);

    const placeholder = segment ? segmentPlaceholder[segment] : DEFAULT_SEGMENT_PLACEHOLDER;
    if (editValue && editValue !== placeholder && editValue.length > 0) {
      let valueToUpdate = editValue;

      if (segment !== "period") {
        if (editValue.length === 2) {
          valueToUpdate = editValue;
        } else if (editValue.length === 1) {
          const numValue = Number.parseInt(editValue, 10);
          if (!Number.isNaN(numValue)) {
            valueToUpdate = numValue.toString().padStart(2, "0");
          }
        }
      }

      updateTimeValue(valueToUpdate, true);

      queueMicrotask(() => {
        const currentTimeValue = parseTimeString(store.getState().value);
        if (currentTimeValue) {
          const now = new Date();
          const newTime = { ...currentTimeValue };
          let needsUpdate = false;

          if (newTime.hour === undefined) {
            newTime.hour = now.getHours();
            needsUpdate = true;
          }

          if (newTime.minute === undefined) {
            newTime.minute = now.getMinutes();
            needsUpdate = true;
          }

          if (showSeconds && newTime.second === undefined) {
            newTime.second = now.getSeconds();
            needsUpdate = true;
          }

          if (needsUpdate) {
            const newValue = formatTimeValue(newTime, showSeconds);
            store.setState("value", newValue);
          }
        }
      });
    }

    setEditValue(getSegmentValue());
    setPendingDigit(null);
  });

  const onChange = useMemoizedFn((event: ChangeEvent<InputElement>) => {
    onChangeProp?.(event);
    if (event.defaultPrevented) return;

    let newValue = event.target.value;

    const placeholder = segment ? segmentPlaceholder[segment] : DEFAULT_SEGMENT_PLACEHOLDER;
    if (editValue === placeholder && newValue.length > 0 && newValue !== placeholder) {
      newValue = newValue.replace(new RegExp(`^${placeholder}`), "");
    }

    if (segment === "period") {
      const firstChar = newValue.charAt(0).toUpperCase();
      let newPeriod: Period | null = null;

      if (firstChar === "A" || firstChar === "1") {
        newPeriod = "AM";
      } else if (firstChar === "P" || firstChar === "2") {
        newPeriod = "PM";
      }

      if (newPeriod) {
        setEditValue(newPeriod);
        updateTimeValue(newPeriod, true);
        queueMicrotask(() => {
          inputRef.current?.select();
        });
      }
      return;
    }

    if (segment === "hour" || segment === "minute" || segment === "second") {
      newValue = newValue.replace(/\D/g, "");
    }

    if (newValue.length > 2) {
      newValue = newValue.slice(0, 2);
    }
    if (segment === "hour" || segment === "minute" || segment === "second") {
      const numValue = Number.parseInt(newValue, 10);

      if (!Number.isNaN(numValue) && newValue.length > 0) {
        if (pendingDigit !== null && newValue.length === 1) {
          const twoDigitValue = pendingDigit + newValue;
          const combinedNum = Number.parseInt(twoDigitValue, 10);

          if (!Number.isNaN(combinedNum)) {
            const paddedValue = combinedNum.toString().padStart(2, "0");
            setEditValue(paddedValue);
            updateTimeValue(paddedValue, true);
            setPendingDigit(null);

            queueMicrotask(() => {
              if (segment) {
                const nextInputRef = inputGroupContext.getNextInput(segment);
                if (nextInputRef?.current) {
                  nextInputRef.current.focus();
                  nextInputRef.current.select();
                }
              }
            });
            return;
          }
        }

        const maxFirstDigit = segment === "hour" ? (is12Hour ? 1 : 2) : 5;

        const firstDigit = Number.parseInt(newValue[0] ?? "0", 10);
        const shouldAutoAdvance = firstDigit > maxFirstDigit;

        if (newValue.length === 1) {
          if (shouldAutoAdvance) {
            const paddedValue = numValue.toString().padStart(2, "0");
            setEditValue(paddedValue);
            updateTimeValue(paddedValue, true);
            setPendingDigit(null);

            queueMicrotask(() => {
              if (segment) {
                const nextInputRef = inputGroupContext.getNextInput(segment);
                if (nextInputRef?.current) {
                  nextInputRef.current.focus();
                  nextInputRef.current.select();
                }
              }
            });
          } else {
            const paddedValue = numValue.toString().padStart(2, "0");
            setEditValue(paddedValue);
            setPendingDigit(newValue);
            queueMicrotask(() => {
              inputRef.current?.select();
            });
          }
        } else if (newValue.length === 2) {
          const paddedValue = numValue.toString().padStart(2, "0");
          setEditValue(paddedValue);
          updateTimeValue(paddedValue, true);
          setPendingDigit(null);

          queueMicrotask(() => {
            if (segment) {
              const nextInputRef = inputGroupContext.getNextInput(segment);
              if (nextInputRef?.current) {
                nextInputRef.current.focus();
                nextInputRef.current.select();
              }
            }
          });
        }
      } else if (newValue.length === 0) {
        setEditValue("");
        setPendingDigit(null);
      }
    }
  });

  const onClick = useMemoizedFn((event: MouseEvent<InputElement>) => {
    onClickProp?.(event);
    if (event.defaultPrevented) return;

    event.currentTarget.select();
  });

  const onFocus = useMemoizedFn((event: FocusEvent<InputElement>) => {
    onFocusProp?.(event);
    if (event.defaultPrevented) return;

    setIsEditing(true);
    setPendingDigit(null);

    if (openOnFocus && !store.getState().open) {
      store.setState("openedViaFocus", true);
      store.setState("open", true);
    }

    queueMicrotask(() => event.target.select());
  });

  const onKeyDown = useMemoizedFn((event: KeyboardEvent<InputElement>) => {
    onKeyDownProp?.(event);
    if (event.defaultPrevented) return;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();

      const goToPrevious = event.key === "ArrowLeft";
      const inputGroup = inputRef.current?.closest('[data-slot="time-picker-input-group"]');

      if (inputGroup && inputRef.current) {
        const allInputs = Array.from(
          inputGroup.querySelectorAll('input[type="text"]')
        ) as HTMLInputElement[];
        const currentIdx = allInputs.indexOf(inputRef.current);

        if (currentIdx !== -1) {
          const targetIdx = goToPrevious
            ? Math.max(0, currentIdx - 1)
            : Math.min(allInputs.length - 1, currentIdx + 1);

          const targetInput = allInputs[targetIdx];
          if (targetInput && targetInput !== inputRef.current) {
            targetInput.focus();
            targetInput.select();
          }
        }
      }
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      const input = inputRef.current;
      if (input && input.selectionStart === 0 && input.selectionEnd === input.value.length) {
        event.preventDefault();
        const placeholder = segment ? segmentPlaceholder[segment] : DEFAULT_SEGMENT_PLACEHOLDER;
        setEditValue(placeholder);
        setPendingDigit(null);

        if (timeValue) {
          const newTime = { ...timeValue };
          switch (segment) {
            case "hour":
              delete newTime.hour;
              break;
            case "minute":
              delete newTime.minute;
              break;
            case "second":
              delete newTime.second;
              break;
            case "period":
              delete newTime.period;
              break;
          }

          if (
            newTime.hour !== undefined ||
            newTime.minute !== undefined ||
            newTime.second !== undefined ||
            newTime.period !== undefined
          ) {
            const newValue = formatTimeValue(newTime, showSeconds);
            store.setState("value", newValue);
          } else {
            store.setState("value", "");
          }
        } else {
          store.setState("value", "");
        }

        queueMicrotask(() => {
          inputRef.current?.select();
        });
        return;
      }
    }

    if (segment === "period") {
      const key = event.key.toLowerCase();
      if (key === "a" || key === "p" || key === "1" || key === "2") {
        event.preventDefault();
        let newPeriod: Period;
        if (key === "a" || key === "1") {
          newPeriod = "AM";
        } else {
          newPeriod = "PM";
        }
        setEditValue(newPeriod);
        updateTimeValue(newPeriod, true);
        queueMicrotask(() => {
          inputRef.current?.select();
        });
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const placeholder = segmentPlaceholder.period;
        const currentPeriod = editValue === placeholder || editValue === "" ? "AM" : editValue;
        const newPeriod = currentPeriod === "AM" || currentPeriod === "A" ? "PM" : "AM";
        setEditValue(newPeriod);
        updateTimeValue(newPeriod, true);
        queueMicrotask(() => {
          inputRef.current?.select();
        });
      }
      return;
    }

    if (event.key === "Tab") {
      const placeholder = segment ? segmentPlaceholder[segment] : DEFAULT_SEGMENT_PLACEHOLDER;
      if (editValue && editValue.length > 0 && editValue !== placeholder) {
        if (editValue.length === 2) {
          updateTimeValue(editValue, true);
        } else if (editValue.length === 1) {
          const numValue = Number.parseInt(editValue, 10);
          if (!Number.isNaN(numValue)) {
            const paddedValue = numValue.toString().padStart(2, "0");
            updateTimeValue(paddedValue, true);
          }
        }
      }
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const placeholder = segment ? segmentPlaceholder[segment] : DEFAULT_SEGMENT_PLACEHOLDER;
      if (editValue && editValue.length > 0 && editValue !== placeholder) {
        if (editValue.length === 2) {
          updateTimeValue(editValue, true);
        } else if (editValue.length === 1) {
          const numValue = Number.parseInt(editValue, 10);
          if (!Number.isNaN(numValue)) {
            const paddedValue = numValue.toString().padStart(2, "0");
            updateTimeValue(paddedValue, true);
          }
        }
      }
      queueMicrotask(() => {
        inputRef.current?.select();
      });
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setEditValue(getSegmentValue());
      inputRef.current?.blur();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const placeholder = segment ? segmentPlaceholder[segment] : DEFAULT_SEGMENT_PLACEHOLDER;
      if (editValue === placeholder || editValue === "") {
        const defaultValue = segment === "hour" ? (is12Hour ? 12 : 0) : 0;
        const formattedValue = defaultValue.toString().padStart(2, "0");
        setEditValue(formattedValue);
        updateTimeValue(formattedValue, true);
        queueMicrotask(() => {
          inputRef.current?.select();
        });
        return;
      }
      const currentValue = Number.parseInt(editValue, 10);
      if (!Number.isNaN(currentValue)) {
        let newValue: number;
        switch (segment) {
          case "hour":
            if (is12Hour) {
              newValue = currentValue === 12 ? 1 : currentValue + 1;
            } else {
              newValue = currentValue === 23 ? 0 : currentValue + 1;
            }
            break;
          case "minute":
          case "second":
            newValue = currentValue === 59 ? 0 : currentValue + 1;
            break;
          default:
            return;
        }
        const formattedValue = newValue.toString().padStart(2, "0");
        setEditValue(formattedValue);
        updateTimeValue(formattedValue, true);
        queueMicrotask(() => {
          inputRef.current?.select();
        });
      }
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const placeholder = segment ? segmentPlaceholder[segment] : DEFAULT_SEGMENT_PLACEHOLDER;
      if (editValue === placeholder || editValue === "") {
        const defaultValue = segment === "hour" ? (is12Hour ? 12 : 23) : 59;
        const formattedValue = defaultValue.toString().padStart(2, "0");
        setEditValue(formattedValue);
        updateTimeValue(formattedValue, true);
        queueMicrotask(() => {
          inputRef.current?.select();
        });
        return;
      }
      const currentValue = Number.parseInt(editValue, 10);
      if (!Number.isNaN(currentValue)) {
        let newValue: number;
        switch (segment) {
          case "hour":
            if (is12Hour) {
              newValue = currentValue === 1 ? 12 : currentValue - 1;
            } else {
              newValue = currentValue === 0 ? 23 : currentValue - 1;
            }
            break;
          case "minute":
          case "second":
            newValue = currentValue === 0 ? 59 : currentValue - 1;
            break;
          default:
            return;
        }
        const formattedValue = newValue.toString().padStart(2, "0");
        setEditValue(formattedValue);
        updateTimeValue(formattedValue, true);
        queueMicrotask(() => {
          inputRef.current?.select();
        });
      }
    }
  });

  const displayValue = isEditing ? editValue : getSegmentValue();

  const segmentWidth = segment ? `var(--time-picker-${segment}-input-width)` : "2ch";

  return (
    <input
      type="text"
      inputMode={segment === "period" ? "text" : "numeric"}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      translate="no"
      {...inputProps}
      disabled={isDisabled}
      readOnly={isReadOnly}
      className={cn(
        "inline-flex h-full items-center justify-center border-0 bg-transparent text-center text-sm tabular-nums outline-none transition-colors focus:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{ width: segmentWidth, ...style }}
      ref={composedRef}
      value={displayValue}
      onBlur={onBlur}
      onChange={onChange}
      onClick={onClick}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
    />
  );
}

function TimePickerTrigger(props: ButtonProps) {
  const { className, children, disabled: disabledProp, ref, ...triggerProps } = props;

  const { triggerId, disabled, triggerRef } = useTimePickerContext(TRIGGER_NAME);

  const isDisabled = disabledProp || disabled;

  const composedRef = useComposedRefs(ref, triggerRef);

  return (
    <PopoverTrigger
      type="button"
      id={triggerId}
      data-slot="time-picker-trigger"
      disabled={isDisabled}
      ref={composedRef}
      {...triggerProps}
      className={cn(
        "ml-auto flex items-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none [&>svg:not([class*='size-'])]:size-4",
        className
      )}
    >
      {children ?? <Clock />}
    </PopoverTrigger>
  );
}

interface TimePickerGroupContextValue {
  getColumns: () => ColumnData[];
  onColumnRegister: (column: ColumnData) => void;
  onColumnUnregister: (id: string) => void;
}

const TimePickerGroupContext = createContext<TimePickerGroupContextValue | null>(null);

function useTimePickerGroupContext(consumerName: string) {
  const context = use(TimePickerGroupContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface TimePickerContentProps extends DivProps, ComponentProps<typeof PopoverContent> {}

function TimePickerPanel(props: DivProps) {
  const { className, ...panelProps } = props;
  const columnsRef = useRef<Map<string, Omit<ColumnData, "id">>>(new Map());

  const onColumnRegister = useMemoizedFn((column: ColumnData) => {
    columnsRef.current.set(column.id, column);
  });

  const onColumnUnregister = useMemoizedFn((id: string) => {
    columnsRef.current.delete(id);
  });

  const getColumns = useMemoizedFn(() => {
    const columns = Array.from(columnsRef.current.entries())
      .map(([id, { ref, getSelectedItemRef, getItems }]) => ({
        id,
        ref,
        getSelectedItemRef,
        getItems,
      }))
      .filter((c) => c.ref.current !== null);
    return sortNodes(columns);
  });

  const groupContextValue: TimePickerGroupContextValue = {
    getColumns,
    onColumnRegister,
    onColumnUnregister,
  };

  return (
    <TimePickerGroupContext value={groupContextValue}>
      <div
        data-slot="time-picker-panel"
        {...panelProps}
        className={cn("flex w-auto p-0", className)}
      />
    </TimePickerGroupContext>
  );
}

function TimePickerContent(props: TimePickerContentProps) {
  const {
    side = "bottom",
    align = "start",
    sideOffset = 6,
    className,
    onOpenAutoFocus: onOpenAutoFocusProp,
    onInteractOutside: onInteractOutsideProp,
    ...contentProps
  } = props;

  const store = useStoreContext(CONTENT_NAME);
  const { openOnFocus, inputGroupRef } = useTimePickerContext(CONTENT_NAME);
  const columnsRef = useRef<Map<string, Omit<ColumnData, "id">>>(new Map());

  const onColumnRegister = useMemoizedFn((column: ColumnData) => {
    columnsRef.current.set(column.id, column);
  });

  const onColumnUnregister = useMemoizedFn((id: string) => {
    columnsRef.current.delete(id);
  });

  const getColumns = useMemoizedFn(() => {
    const columns = Array.from(columnsRef.current.entries())
      .map(([id, { ref, getSelectedItemRef, getItems }]) => ({
        id,
        ref,
        getSelectedItemRef,
        getItems,
      }))
      .filter((c) => c.ref.current !== null);
    return sortNodes(columns);
  });

  const groupContextValue: TimePickerGroupContextValue = {
    getColumns,
    onColumnRegister,
    onColumnUnregister,
  };

  const onOpenAutoFocus: NonNullable<PopoverContentProps["onOpenAutoFocus"]> = useMemoizedFn(
    (event) => {
      onOpenAutoFocusProp?.(event);
      if (event.defaultPrevented) return;

      event.preventDefault();

      const { openedViaFocus } = store.getState();

      if (openedViaFocus) {
        store.setState("openedViaFocus", false);
        return;
      }

      const columns = getColumns();
      const firstColumn = columns[0];

      if (!firstColumn) return;

      const items = firstColumn.getItems();
      const selectedItem = items.find((item) => item.selected);

      const candidateRefs = selectedItem
        ? [selectedItem.ref, ...items.map((item) => item.ref)]
        : items.map((item) => item.ref);

      focusFirst(candidateRefs, false);
    }
  );

  const onInteractOutside: NonNullable<PopoverContentProps["onInteractOutside"]> = useMemoizedFn(
    (event) => {
      onInteractOutsideProp?.(event);
      if (event.defaultPrevented) return;

      if (openOnFocus && inputGroupRef.current) {
        const target = event.target;
        if (!(target instanceof Node)) return;
        const isInsideInputGroup = inputGroupRef.current.contains(target);

        if (isInsideInputGroup) {
          event.preventDefault();
        }
      }
    }
  );

  return (
    <TimePickerGroupContext value={groupContextValue}>
      <PopoverContent
        data-slot="time-picker-content"
        side={side}
        align={align}
        sideOffset={sideOffset}
        {...contentProps}
        className={cn("flex w-auto max-w-(--radix-popover-trigger-width) p-0", className)}
        onOpenAutoFocus={onOpenAutoFocus}
        onInteractOutside={onInteractOutside}
      />
    </TimePickerGroupContext>
  );
}

interface TimePickerColumnContextValue {
  getItems: () => ItemData[];
  onItemRegister: (
    value: number | string,
    ref: RefObject<ColumnItemElement | null>,
    selected: boolean
  ) => void;
  onItemUnregister: (value: number | string) => void;
}

const TimePickerColumnContext = createContext<TimePickerColumnContextValue | null>(null);

function useTimePickerColumnContext(consumerName: string) {
  const context = use(TimePickerColumnContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within a column`);
  }
  return context;
}

interface TimePickerColumnProps extends DivProps {}

function TimePickerColumn(props: TimePickerColumnProps) {
  const { children, className, ref, ...columnProps } = props;

  const columnId = useId();
  const columnRef = useRef<ColumnElement | null>(null);
  const composedRef = useComposedRefs(ref, columnRef);

  const itemsRef = useRef<
    Map<
      number | string,
      {
        ref: RefObject<ColumnItemElement | null>;
        selected: boolean;
      }
    >
  >(new Map());

  const groupContext = useTimePickerGroupContext(COLUMN_NAME);

  const onItemRegister = useMemoizedFn(
    (value: number | string, ref: RefObject<HTMLButtonElement | null>, selected: boolean) => {
      itemsRef.current.set(value, { ref, selected });
    }
  );

  const onItemUnregister = useMemoizedFn((value: number | string) => {
    itemsRef.current.delete(value);
  });

  const getItems = useMemoizedFn(() => {
    const items = Array.from(itemsRef.current.entries())
      .map(([value, { ref, selected }]) => ({
        value,
        ref,
        selected,
      }))
      .filter((item) => item.ref.current);
    return sortNodes(items);
  });

  const getSelectedItemRef = useMemoizedFn(() => {
    const items = getItems();
    return items.find((item) => item.selected)?.ref ?? null;
  });

  // Columns register with the group so panel focus can land on selected values.
  useIsomorphicLayoutEffect(() => {
    groupContext.onColumnRegister({
      id: columnId,
      ref: columnRef,
      getSelectedItemRef,
      getItems,
    });
    return () => groupContext.onColumnUnregister(columnId);
  }, [groupContext, columnId, getSelectedItemRef, getItems]);

  const columnContextValue: TimePickerColumnContextValue = {
    getItems,
    onItemRegister,
    onItemUnregister,
  };

  return (
    <TimePickerColumnContext value={columnContextValue}>
      <div
        ref={composedRef}
        data-slot="time-picker-column"
        {...columnProps}
        className={cn("flex flex-col gap-1 not-last:border-r p-1", className)}
      >
        {children}
      </div>
    </TimePickerColumnContext>
  );
}

interface TimePickerColumnItemProps extends ButtonProps {
  value: number | string;
  selected?: boolean;
  format?: SegmentFormat;
}

function TimePickerColumnItem(props: TimePickerColumnItemProps) {
  const {
    value,
    selected = false,
    format = "numeric",
    className,
    ref,
    disabled,
    ...itemProps
  } = props;

  const itemRef = useRef<ColumnItemElement | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const composedRef = useComposedRefs(ref, itemRef);
  const columnContext = useTimePickerColumnContext(COLUMN_ITEM_NAME);
  const groupContext = useTimePickerGroupContext(COLUMN_ITEM_NAME);

  const scrollItemToTop = useMemoizedFn((behavior: ScrollBehavior = "auto") => {
    const item = itemRef.current;
    const column = item?.closest<HTMLElement>(
      "[data-slot='time-picker-hour'], [data-slot='time-picker-minute'], [data-slot='time-picker-second'], [data-slot='time-picker-period']"
    );
    if (!item || !column) return;
    const targetTop = Math.max(item.offsetTop - column.offsetTop - 8, 0);

    if (scrollAnimationRef.current !== null) {
      window.cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }

    if (behavior !== "smooth") {
      column.scrollTop = targetTop;
      return;
    }

    const startTop = column.scrollTop;
    const distance = targetTop - startTop;
    const duration = 180;
    const startTime = window.performance.now();

    if (Math.abs(distance) < 1) {
      column.scrollTop = targetTop;
      return;
    }

    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      column.scrollTop = startTop + distance * easedProgress;

      if (progress < 1) {
        scrollAnimationRef.current = window.requestAnimationFrame(step);
        return;
      }

      column.scrollTop = targetTop;
      scrollAnimationRef.current = null;
    };

    scrollAnimationRef.current = window.requestAnimationFrame(step);
  });

  // Column items register with their column so arrow-key roving focus has ordered targets.
  useIsomorphicLayoutEffect(() => {
    columnContext.onItemRegister(value, itemRef, selected);
    return () => columnContext.onItemUnregister(value);
  }, [columnContext, value, selected]);

  // Selected items scroll into view when selection changes from typing or panel actions.
  useIsomorphicLayoutEffect(() => {
    if (selected && itemRef.current) {
      scrollItemToTop("smooth");
    }
  }, [selected, scrollItemToTop]);

  const onClick = useMemoizedFn((event: MouseEvent<ColumnItemElement>) => {
    itemProps.onClick?.(event);
    if (event.defaultPrevented) return;

    itemRef.current?.focus();
    scrollItemToTop("smooth");
  });

  const onKeyDown = useMemoizedFn((event: KeyboardEvent<ColumnItemElement>) => {
    itemProps.onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const items = columnContext.getItems().sort((a, b) => {
        if (typeof a.value === "number" && typeof b.value === "number") {
          return a.value - b.value;
        }
        return 0;
      });
      const currentIndex = items.findIndex((item) => item.value === value);

      let nextIndex: number;
      if (event.key === "ArrowUp") {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      } else {
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      }

      const nextItem = items[nextIndex];
      nextItem?.ref.current?.focus();
      nextItem?.ref.current?.click();
    } else if (
      (event.key === "Tab" || event.key === "ArrowLeft" || event.key === "ArrowRight") &&
      groupContext
    ) {
      event.preventDefault();

      queueMicrotask(() => {
        const columns = groupContext.getColumns();

        if (columns.length === 0) return;

        const currentColumnIndex = columns.findIndex(
          (c) => c.ref.current?.contains(itemRef.current) ?? false
        );

        if (currentColumnIndex === -1) return;

        const goToPrevious = event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey);

        const nextColumnIndex = goToPrevious
          ? currentColumnIndex > 0
            ? currentColumnIndex - 1
            : columns.length - 1
          : currentColumnIndex < columns.length - 1
            ? currentColumnIndex + 1
            : 0;

        const nextColumn = columns[nextColumnIndex];
        if (nextColumn?.ref.current) {
          const items = nextColumn.getItems();
          const selectedItem = items.find((item) => item.selected);

          const candidateRefs = selectedItem
            ? [selectedItem.ref, ...items.map((item) => item.ref)]
            : items.map((item) => item.ref);

          focusFirst(candidateRefs, false);
        }
      });
    }
  });

  const formattedValue =
    typeof value === "number" && format === "2-digit"
      ? value.toString().padStart(2, "0")
      : value.toString();

  return (
    <Button
      type="button"
      variant={selected ? "default" : "ghost"}
      {...itemProps}
      disabled={disabled}
      ref={composedRef}
      data-selected={selected ? "" : undefined}
      className={cn(
        "h-8 w-full shrink-0 px-3 text-center",
        selected && "hover:bg-primary hover:text-primary-foreground",
        className
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {formattedValue}
    </Button>
  );
}

interface TimePickerHourProps extends DivProps {
  format?: SegmentFormat;
}

function TimePickerHour(props: TimePickerHourProps) {
  const { asChild, format = "numeric", className, ...hourProps } = props;

  const { is12Hour, hourStep, showSeconds } = useTimePickerContext(HOUR_NAME);
  const store = useStoreContext(HOUR_NAME);
  const { disabledHours } = useTimePickerContext(HOUR_NAME);

  const value = useStore((state) => state.value);
  const timeValue = parseTimeString(value);

  const hours = Array.from(
    {
      length: is12Hour ? Math.ceil(12 / hourStep) : Math.ceil(24 / hourStep),
    },
    (_, i) => {
      if (is12Hour) {
        const hour = (i * hourStep) % 12;
        return hour === 0 ? 12 : hour;
      }
      return i * hourStep;
    }
  );

  const onHourSelect = useMemoizedFn((displayHour: number) => {
    const now = new Date();
    const currentTime = timeValue ?? {};

    let hour24 = displayHour;
    if (is12Hour) {
      let currentPeriod: Period;
      if (timeValue?.period !== undefined) {
        currentPeriod = timeValue.period;
      } else if (timeValue?.hour !== undefined) {
        currentPeriod = to12Hour(timeValue.hour).period;
      } else {
        currentPeriod = to12Hour(now.getHours()).period;
      }
      hour24 = to24Hour(displayHour, currentPeriod);
    }

    const newTime = { ...currentTime, hour: hour24 };
    if (timeValue && timeValue.period !== undefined) {
      newTime.period = timeValue.period;
    }

    if (newTime.minute === undefined) {
      newTime.minute = now.getMinutes();
    }

    if (showSeconds && newTime.second === undefined) {
      newTime.second = now.getSeconds();
    }

    const newValue = formatTimeValue(newTime, showSeconds);
    store.setState("value", newValue);
  });

  const now = new Date();
  const referenceHour = timeValue?.hour ?? now.getHours();
  const displayHour = is12Hour ? to12Hour(referenceHour).hour : referenceHour;
  const disabledHourSet = new Set(disabledHours?.() ?? []);

  const HourPrimitive = asChild ? SlotPrimitive.Slot : TimePickerColumn;

  return (
    <HourPrimitive
      data-slot="time-picker-hour"
      {...hourProps}
      className={cn(
        "scrollbar-none flex max-h-[200px] flex-col gap-1 overflow-y-auto p-1 after:h-[calc(100%-2rem)] after:shrink-0 after:content-['']",
        className
      )}
    >
      {hours.map((hour) => (
        <TimePickerColumnItem
          key={hour}
          value={hour}
          selected={displayHour === hour}
          disabled={disabledHourSet.has(
            is12Hour ? to24Hour(hour, timeValue?.period ?? to12Hour(referenceHour).period) : hour
          )}
          format={format}
          onClick={() => onHourSelect(hour)}
        />
      ))}
    </HourPrimitive>
  );
}

interface TimePickerMinuteProps extends DivProps {
  format?: SegmentFormat;
}

function TimePickerMinute(props: TimePickerMinuteProps) {
  const { asChild, format = "2-digit", className, ...minuteProps } = props;

  const { minuteStep, showSeconds, disabledMinutes } = useTimePickerContext(MINUTE_NAME);
  const store = useStoreContext(MINUTE_NAME);

  const value = useStore((state) => state.value);
  const timeValue = parseTimeString(value);

  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);

  const onMinuteSelect = useMemoizedFn((minute: number) => {
    const now = new Date();
    const currentTime = timeValue ?? {};
    const newTime = { ...currentTime, minute };

    if (newTime.hour === undefined) {
      newTime.hour = now.getHours();
    }

    if (showSeconds && newTime.second === undefined) {
      newTime.second = now.getSeconds();
    }

    const newValue = formatTimeValue(newTime, showSeconds);
    store.setState("value", newValue);
  });

  const MinutePrimitive = asChild ? SlotPrimitive.Slot : TimePickerColumn;

  const now = new Date();
  const referenceMinute = timeValue?.minute ?? now.getMinutes();
  const disabledMinuteSet = new Set(
    timeValue?.hour !== undefined ? (disabledMinutes?.(timeValue.hour) ?? []) : []
  );

  return (
    <MinutePrimitive
      data-slot="time-picker-minute"
      {...minuteProps}
      className={cn(
        "scrollbar-none flex max-h-[200px] flex-col gap-1 overflow-y-auto p-1 after:h-[calc(100%-2rem)] after:shrink-0 after:content-['']",
        className
      )}
    >
      {minutes.map((minute) => (
        <TimePickerColumnItem
          key={minute}
          value={minute}
          selected={referenceMinute === minute}
          disabled={disabledMinuteSet.has(minute)}
          format={format}
          onClick={() => onMinuteSelect(minute)}
        />
      ))}
    </MinutePrimitive>
  );
}

interface TimePickerSecondProps extends DivProps {
  format?: SegmentFormat;
}

function TimePickerSecond(props: TimePickerSecondProps) {
  const { asChild, format = "2-digit", className, ...secondProps } = props;

  const { secondStep, disabledSeconds } = useTimePickerContext(SECOND_NAME);
  const store = useStoreContext(SECOND_NAME);

  const value = useStore((state) => state.value);
  const timeValue = parseTimeString(value);

  const seconds = Array.from({ length: Math.ceil(60 / secondStep) }, (_, i) => i * secondStep);

  const onSecondSelect = useMemoizedFn((second: number) => {
    const now = new Date();
    const currentTime = timeValue ?? {};
    const newTime = { ...currentTime, second };

    if (newTime.hour === undefined) {
      newTime.hour = now.getHours();
    }

    if (newTime.minute === undefined) {
      newTime.minute = now.getMinutes();
    }

    const newValue = formatTimeValue(newTime, true);
    store.setState("value", newValue);
  });

  const SecondPrimitive = asChild ? SlotPrimitive.Slot : TimePickerColumn;

  const now = new Date();
  const referenceSecond = timeValue?.second ?? now.getSeconds();
  const disabledSecondSet = new Set(
    timeValue?.hour !== undefined && timeValue?.minute !== undefined
      ? (disabledSeconds?.(timeValue.hour, timeValue.minute) ?? [])
      : []
  );

  return (
    <SecondPrimitive
      data-slot="time-picker-second"
      {...secondProps}
      className={cn(
        "scrollbar-none flex max-h-[200px] flex-col gap-1 overflow-y-auto p-1 after:h-[calc(100%-2rem)] after:shrink-0 after:content-['']",
        className
      )}
    >
      {seconds.map((second) => (
        <TimePickerColumnItem
          key={second}
          value={second}
          selected={referenceSecond === second}
          disabled={disabledSecondSet.has(second)}
          format={format}
          onClick={() => onSecondSelect(second)}
        />
      ))}
    </SecondPrimitive>
  );
}

function TimePickerPeriod(props: DivProps) {
  const { asChild, className, ...periodProps } = props;

  const { is12Hour, showSeconds, disabledPeriods } = useTimePickerContext(PERIOD_NAME);
  const store = useStoreContext(PERIOD_NAME);

  const value = useStore((state) => state.value);
  const timeValue = parseTimeString(value);

  const onPeriodToggle = useMemoizedFn((period: Period) => {
    const now = new Date();
    const currentTime = timeValue ?? {};

    const currentHour = currentTime.hour !== undefined ? currentTime.hour : now.getHours();
    const currentDisplay = to12Hour(currentHour);
    const new24Hour = to24Hour(currentDisplay.hour, period);

    const newTime = { ...currentTime, hour: new24Hour };

    if (newTime.minute === undefined) {
      newTime.minute = now.getMinutes();
    }

    if (showSeconds && newTime.second === undefined) {
      newTime.second = now.getSeconds();
    }

    const newValue = formatTimeValue(newTime, showSeconds);
    store.setState("value", newValue);
  });

  if (!is12Hour) return null;

  const now = new Date();
  const referenceHour = timeValue?.hour ?? now.getHours();
  const currentPeriod = to12Hour(referenceHour).period;
  const disabledPeriodSet = new Set(disabledPeriods?.() ?? []);

  const PeriodPrimitive = asChild ? SlotPrimitive.Slot : TimePickerColumn;

  return (
    <PeriodPrimitive
      data-slot="time-picker-period"
      {...periodProps}
      className={cn("flex flex-col gap-1 p-1", className)}
    >
      {PERIODS.map((period) => (
        <TimePickerColumnItem
          key={period}
          value={period}
          selected={currentPeriod === period}
          disabled={disabledPeriodSet.has(period)}
          onClick={() => onPeriodToggle(period)}
        />
      ))}
    </PeriodPrimitive>
  );
}

interface TimePickerSeparatorProps extends ComponentProps<"span"> {
  asChild?: boolean;
}

function TimePickerSeparator(props: TimePickerSeparatorProps) {
  const { asChild, children, ...separatorProps } = props;

  const SeparatorPrimitive = asChild ? SlotPrimitive.Slot : "span";

  return (
    <SeparatorPrimitive aria-hidden="true" data-slot="time-picker-separator" {...separatorProps}>
      {children ?? ":"}
    </SeparatorPrimitive>
  );
}

function TimePickerClear(props: ButtonProps) {
  const { asChild, className, children, disabled: disabledProp, ...clearProps } = props;

  const { disabled, readOnly } = useTimePickerContext(CLEAR_NAME);
  const store = useStoreContext(CLEAR_NAME);

  const isDisabled = disabledProp || disabled;

  const onClick = useMemoizedFn((event: MouseEvent<HTMLButtonElement>) => {
    clearProps.onClick?.(event);
    if (event.defaultPrevented) return;

    event.preventDefault();
    if (disabled || readOnly) return;
    store.setState("value", "");
  });

  const ClearPrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <ClearPrimitive
      type="button"
      data-slot="time-picker-clear"
      disabled={isDisabled}
      {...clearProps}
      className={cn(
        "inline-flex items-center justify-center rounded-sm font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={onClick}
    >
      {children ?? "Clear"}
    </ClearPrimitive>
  );
}

export {
  TimePicker,
  TimePickerClear,
  TimePickerContent,
  TimePickerHour,
  TimePickerInput,
  TimePickerInputGroup,
  TimePickerLabel,
  TimePickerMinute,
  TimePickerPanel,
  TimePickerPeriod,
  //
  type TimePickerProps,
  TimePickerSecond,
  TimePickerSeparator,
  TimePickerTrigger,
  //
  useStore as useTimePicker,
};
