import { Input as UIInput } from "@rap/components-ui/input";
import { cn } from "@rap/utils";
import { type RefObject } from "react";

interface RangeTriggerFieldProps {
  value: string;
  placeholder?: string;
  active: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  inputClassName?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur?: () => void;
}

function RangeTriggerField(props: RangeTriggerFieldProps) {
  const {
    value,
    placeholder,
    active,
    disabled,
    readOnly,
    inputClassName,
    inputRef,
    onChange,
    onFocus,
    onBlur,
  } = props;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center rounded-sm px-1 transition-colors",
        active && "bg-accent/60"
      )}
    >
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
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        onMouseDown={(event) => {
          event.stopPropagation();
          if (!disabled && !readOnly) {
            onFocus();
          }
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (!disabled && !readOnly) {
            onFocus();
          }
        }}
      />
    </div>
  );
}

export { RangeTriggerField };
