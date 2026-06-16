import { Button } from "@rap/components-ui/button";
import { Input as UIInput } from "@rap/components-ui/input";
import { cn } from "@rap/utils";
import { CalendarDays, ChevronDown, XCircle } from "lucide-react";
import { type ComponentProps, type ReactNode, type RefObject } from "react";

interface PickerTriggerProps extends Omit<ComponentProps<"div">, "prefix" | "onChange"> {
  open: boolean;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  allowClear?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  icon?: ReactNode;
  inputClassName?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  onValueChange: (value: string) => void;
  onOpenRequest: () => void;
  onClear: () => void;
}

function PickerTrigger(props: PickerTriggerProps) {
  const {
    open,
    value,
    placeholder,
    disabled,
    readOnly,
    allowClear,
    prefix,
    suffix,
    icon,
    inputClassName,
    inputRef,
    onValueChange,
    onOpenRequest,
    onClear,
    className,
    ...restProps
  } = props;

  const showClear = !!allowClear && !disabled && !!value;

  return (
    <div
      {...restProps}
      className={cn(
        "group flex min-h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-xs transition-[color,box-shadow,border-color]",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/45",
        "hover:border-ring/40",
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
        readOnly && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {prefix ? <span className="shrink-0 text-muted-foreground">{prefix}</span> : null}
      <UIInput
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={cn(
          "h-9 flex-1 border-0 !bg-transparent px-0 py-2 text-sm shadow-none ring-0 focus-visible:border-transparent focus-visible:ring-0",
          inputClassName
        )}
        onFocus={() => {
          if (!disabled && !readOnly) {
            onOpenRequest();
          }
        }}
        onChange={(event) => onValueChange(event.target.value)}
        onMouseDown={(event) => {
          event.stopPropagation();
          if (!disabled && !readOnly) {
            onOpenRequest();
          }
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (!disabled && !readOnly) {
            onOpenRequest();
          }
        }}
      />
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
          {!suffix && !icon ? (
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          ) : null}
        </span>
      )}
    </div>
  );
}

export { PickerTrigger };
