import type React from "react";
import { ChevronDown, XCircle } from "lucide-react";
import { Button } from "@rap/components-ui/button";
import { Input as UIInput } from "@rap/components-ui/input";
import { cn } from "@rap/utils";
import { SelectTagList } from "./tag-list";
import type { SelectInputProps, SelectOption, SelectProps, SelectValue } from "./types";

interface SelectTriggerProps<V extends SelectValue> extends Omit<
  React.ComponentProps<"div">,
  "prefix" | "onChange"
> {
  rootRef?: React.RefObject<HTMLDivElement | null>;
  multiple: boolean;
  searchable: boolean;
  open: boolean;
  disabled?: boolean;
  hovered: boolean;
  allowClear?: boolean;
  values: V[];
  inputValue: string;
  selectedLabel: string;
  selectedOptions: SelectOption<V>[];
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  rootClassName?: string;
  className?: string;
  inputProps: SelectInputProps;
  maxTagCount?: number | "responsive";
  maxTagPlaceholder?: React.ReactNode | ((omitted: SelectOption<V>[]) => React.ReactNode);
  tagRender?: SelectProps<V>["tagRender"];
  labelRender?: SelectProps<V>["labelRender"];
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClear: () => void;
  onContainerClick: () => void;
  onContainerKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onInputChange: React.ChangeEventHandler<HTMLInputElement>;
  onInputFocus: React.FocusEventHandler<HTMLInputElement>;
  onInputBlur?: React.FocusEventHandler<HTMLInputElement>;
  onInputKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  onInputPointerDown: () => void;
  onTagRemove: (option: SelectOption<V>) => void;
}

export function SelectTrigger<V extends SelectValue>({
  rootRef,
  multiple,
  searchable,
  open,
  disabled,
  hovered,
  allowClear,
  values,
  inputValue,
  selectedLabel,
  selectedOptions,
  placeholder,
  prefix,
  suffix,
  rootClassName,
  className,
  inputProps,
  maxTagCount,
  maxTagPlaceholder,
  tagRender,
  labelRender,
  inputRef,
  onClear,
  onContainerClick,
  onContainerKeyDown,
  onMouseEnter,
  onMouseLeave,
  onInputChange,
  onInputFocus,
  onInputBlur,
  onInputKeyDown,
  onInputPointerDown,
  onTagRemove,
  ...rootProps
}: SelectTriggerProps<V>) {
  const displayValue = searchable ? inputValue : selectedLabel;
  const showClear =
    !!allowClear && !disabled && (values.length > 0 || inputValue.length > 0) && hovered;

  const triggerIcon = showClear ? (
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
    <span className="flex size-5 items-center justify-center bg-transparent text-muted-foreground">
      {suffix ?? (
        <ChevronDown className={cn("size-5 transition-transform", open && "rotate-180")} />
      )}
    </span>
  );

  return (
    <div
      ref={rootRef}
      {...rootProps}
      className={cn(
        "group flex min-h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-xs transition-[color,box-shadow,border-color]",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/45",
        "hover:border-ring/40",
        disabled && "cursor-not-allowed opacity-50",
        rootClassName
      )}
      role="combobox"
      aria-expanded={open}
      aria-disabled={disabled}
      tabIndex={searchable || disabled ? -1 : 0}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onContainerClick}
      onKeyDown={onContainerKeyDown}
    >
      {prefix ? <span className="shrink-0 text-muted-foreground">{prefix}</span> : null}
      {multiple ? (
        <SelectTagList
          options={selectedOptions}
          values={values}
          maxTagCount={maxTagCount}
          maxTagPlaceholder={maxTagPlaceholder}
          tagRender={tagRender}
          onRemove={onTagRemove}
        />
      ) : null}
      {searchable ? (
        <UIInput
          {...inputProps}
          ref={inputRef}
          className={cn(
            "h-9 min-w-0 border-0 !bg-transparent px-0 py-2 text-sm shadow-none ring-0 focus-visible:border-transparent focus-visible:ring-0",
            multiple ? "min-w-16 flex-1" : "flex-1",
            className
          )}
          disabled={disabled}
          value={displayValue}
          placeholder={multiple && selectedOptions.length ? undefined : placeholder}
          onFocus={onInputFocus}
          onPointerDown={() => onInputPointerDown()}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onBlur={onInputBlur}
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
        />
      ) : (
        <div
          className={cn(
            "min-w-0 flex-1 truncate",
            !selectedLabel && "text-muted-foreground",
            className
          )}
        >
          {!multiple
            ? selectedLabel || placeholder
            : (labelRender?.(selectedOptions) ??
              selectedOptions.map((item) => String(item.label)).join(", "))}
        </div>
      )}
      {triggerIcon}
    </div>
  );
}
