import { Button } from "@rap/components-ui/button";
import { cn } from "@rap/utils";
import { ArrowRight, CalendarDays, XCircle } from "lucide-react";
import type { ComponentProps, ReactNode, RefObject } from "react";
import { RangeTriggerField } from "./range-trigger-field";

interface RangePickerTriggerProps extends Omit<ComponentProps<"div">, "prefix" | "onChange"> {
  open: boolean;
  startValue: string;
  endValue: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  separator?: ReactNode;
  activePart: "start" | "end";
  disabled?: boolean;
  readOnly?: boolean;
  allowClear?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  icon?: ReactNode;
  inputClassName?: string;
  startRef?: RefObject<HTMLInputElement | null>;
  endRef?: RefObject<HTMLInputElement | null>;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onStartFocus: () => void;
  onEndFocus: () => void;
  onStartBlur?: () => void;
  onEndBlur?: () => void;
  onClear: () => void;
}

function RangePickerTrigger(props: RangePickerTriggerProps) {
  const {
    open,
    startValue,
    endValue,
    startPlaceholder,
    endPlaceholder,
    separator,
    activePart,
    disabled,
    readOnly,
    allowClear,
    prefix,
    suffix,
    icon,
    inputClassName,
    startRef,
    endRef,
    onStartChange,
    onEndChange,
    onStartFocus,
    onEndFocus,
    onStartBlur,
    onEndBlur,
    onClear,
    className,
    ...restProps
  } = props;

  const showClear = !!allowClear && !disabled && (!!startValue || !!endValue);

  return (
    <div
      {...restProps}
      className={cn(
        "group flex min-h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-xs transition-[color,box-shadow,border-color]",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/45",
        "hover:border-ring/40",
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
        readOnly && "cursor-not-allowed opacity-50",
        className,
      )}
      onClick={() => {
        if (!disabled && !readOnly) {
          (activePart === "start" ? onStartFocus : onEndFocus)();
        }
      }}
    >
      {prefix ? <span className="shrink-0 text-muted-foreground">{prefix}</span> : null}
      <div className="flex min-w-0 flex-1 items-center">
        <RangeTriggerField
          value={startValue}
          placeholder={startPlaceholder}
          active={activePart === "start" && open}
          disabled={disabled}
          readOnly={readOnly}
          inputClassName={inputClassName}
          inputRef={startRef}
          onChange={onStartChange}
          onFocus={onStartFocus}
          onBlur={onStartBlur}
        />
        <span className="flex shrink-0 items-center px-2 text-muted-foreground">
          {separator ?? <ArrowRight className="size-4" strokeWidth={1.8} />}
        </span>
        <RangeTriggerField
          value={endValue}
          placeholder={endPlaceholder}
          active={activePart === "end" && open}
          disabled={disabled}
          readOnly={readOnly}
          inputClassName={inputClassName}
          inputRef={endRef}
          onChange={onEndChange}
          onFocus={onEndFocus}
          onBlur={onEndBlur}
        />
      </div>
      {showClear ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="size-6 cursor-pointer rounded-full bg-transparent p-0 text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.stopPropagation();
            onClear();
          }}
        >
          <XCircle className="size-5" />
        </Button>
      ) : (
        <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
          {suffix ?? icon ?? <CalendarDays className="size-4" />}
        </span>
      )}
    </div>
  );
}

export { RangePickerTrigger };
