import * as React from "react";
import { Eye, EyeOff, XCircle } from "lucide-react";
import { useTranslation } from "@rap/i18n";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@rap/components-ui/input-group";
import { cn } from "@rap/utils";

type InputValue = string | number | readonly string[];

type ClearConfig = {
  icon?: React.ReactNode;
  ariaLabel?: string;
};

export interface InputProps extends Omit<
  React.ComponentPropsWithoutRef<typeof InputGroupInput>,
  "prefix"
> {
  ref?: React.Ref<HTMLInputElement>;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  allowClear?: boolean | ClearConfig;
  onClear?: () => void;
  onValueChange?: (value: string) => void;
  inputClassName?: string;
  prefixClassName?: string;
  suffixClassName?: string;
  addonClassName?: string;
  clearButtonClassName?: string;
}

const setRef = (ref: React.Ref<HTMLInputElement> | undefined, value: HTMLInputElement | null) => {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  ref.current = value;
};

const getValueText = (value: InputValue | undefined) => {
  if (value === undefined) {
    return "";
  }

  return Array.isArray(value) ? value.join(",") : String(value);
};

const getClearConfig = (allowClear: InputProps["allowClear"]): ClearConfig => {
  if (typeof allowClear === "object") {
    return allowClear;
  }

  return {};
};

export function Input({
  ref,
  value,
  defaultValue,
  onChange,
  onClear,
  onValueChange,
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  allowClear,
  className,
  inputClassName,
  prefixClassName,
  suffixClassName,
  addonClassName,
  clearButtonClassName,
  disabled,
  ...props
}: InputProps) {
  const { t } = useTranslation("pro");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const skipNextValueChangeRef = React.useRef(false);
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = React.useState(() => getValueText(defaultValue));

  const handleInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      setRef(ref, node);
    },
    [ref]
  );

  const currentValue = isControlled ? getValueText(value) : innerValue;
  const showClear = Boolean(allowClear && !disabled && currentValue.length > 0);
  const clearConfig = getClearConfig(allowClear);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInnerValue(event.target.value);
    }

    if (skipNextValueChangeRef.current) {
      skipNextValueChangeRef.current = false;
    } else {
      onValueChange?.(event.target.value);
    }

    onChange?.(event);
  };

  const handleClear = () => {
    if (disabled) {
      return;
    }

    const input = inputRef.current;

    if (!isControlled) {
      setInnerValue("");
    }

    onValueChange?.("");

    if (input) {
      const nativeValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;

      nativeValueSetter?.call(input, "");
      skipNextValueChangeRef.current = true;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      skipNextValueChangeRef.current = false;
      input.focus();
    }

    onClear?.();
  };

  return (
    <InputGroup data-disabled={disabled} className={cn("items-center", className)}>
      {addonBefore && (
        <InputGroupAddon
          align="inline-start"
          className={cn("self-stretch border-r bg-muted/40 px-3 text-foreground", addonClassName)}
        >
          <InputGroupText>{addonBefore}</InputGroupText>
        </InputGroupAddon>
      )}

      {prefix && (
        <InputGroupAddon align="inline-start" className={cn("shrink-0 gap-1.5", prefixClassName)}>
          <InputGroupText>{prefix}</InputGroupText>
        </InputGroupAddon>
      )}

      <InputGroupInput
        ref={handleInputRef}
        value={isControlled ? value : innerValue}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "h-full py-1.5 leading-5",
          (prefix || addonBefore) && "pl-0",
          (suffix || addonAfter || showClear) && "pr-0",
          inputClassName
        )}
        {...props}
      />

      {showClear && (
        <InputGroupAddon align="inline-end" className="shrink-0">
          <InputGroupButton
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className={cn("hover:bg-transparent focus-visible:ring-0", clearButtonClassName)}
            type="button"
            aria-label={clearConfig.ariaLabel ?? t("input.clear")}
          >
            {clearConfig.icon ?? <XCircle className="size-4 text-muted-foreground" />}
          </InputGroupButton>
        </InputGroupAddon>
      )}

      {suffix && (
        <InputGroupAddon align="inline-end" className={cn("shrink-0 gap-1.5", suffixClassName)}>
          <InputGroupText>{suffix}</InputGroupText>
        </InputGroupAddon>
      )}

      {addonAfter && (
        <InputGroupAddon
          align="inline-end"
          className={cn("self-stretch border-l bg-muted/40 px-3 text-foreground", addonClassName)}
        >
          <InputGroupText>{addonAfter}</InputGroupText>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

Input.displayName = "Input";

export interface PasswordInputProps extends Omit<InputProps, "type" | "suffix"> {
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  visibilityToggleClassName?: string;
  visibilityIcons?: {
    visible?: React.ReactNode;
    hidden?: React.ReactNode;
  };
}

export function PasswordInput({
  visible,
  defaultVisible = false,
  onVisibleChange,
  visibilityToggleClassName,
  visibilityIcons,
  disabled,
  ...props
}: PasswordInputProps) {
  const isControlled = visible !== undefined;
  const [innerVisible, setInnerVisible] = React.useState(defaultVisible);
  const currentVisible = isControlled ? visible : innerVisible;

  const handleVisibleChange = () => {
    if (disabled) {
      return;
    }

    const nextVisible = !currentVisible;

    if (!isControlled) {
      setInnerVisible(nextVisible);
    }

    onVisibleChange?.(nextVisible);
  };

  return (
    <Input
      type={currentVisible ? "text" : "password"}
      disabled={disabled}
      suffix={
        <InputGroupButton
          variant="ghost"
          size="icon-sm"
          type="button"
          disabled={disabled}
          aria-label={currentVisible ? "Hide password" : "Show password"}
          aria-pressed={currentVisible}
          onClick={handleVisibleChange}
          className={cn("hover:bg-transparent focus-visible:ring-0", visibilityToggleClassName)}
        >
          {currentVisible
            ? (visibilityIcons?.visible ?? <EyeOff className="size-4 text-muted-foreground" />)
            : (visibilityIcons?.hidden ?? <Eye className="size-4 text-muted-foreground" />)}
        </InputGroupButton>
      }
      {...props}
    />
  );
}

PasswordInput.displayName = "PasswordInput";

export interface InputNumberProps extends Omit<
  InputProps,
  "value" | "defaultValue" | "onChange" | "type" | "onValueChange"
> {
  value?: number | string | null;
  defaultValue?: number | string;
  onChange?: (value: number | string | null) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  stringMode?: boolean;
  controls?: boolean;
  keyboard?: boolean;
  formatter?: (value: string) => string;
  parser?: (value: string) => string;
}

function toText(value: InputNumberProps["value"]) {
  return value === null || value === undefined ? "" : String(value);
}

function normalizeNumberText(
  text: string,
  props: Pick<InputNumberProps, "min" | "max" | "precision">
) {
  if (text.trim() === "" || text === "-" || text === ".") return "";
  const parsed = Number(text);
  if (Number.isNaN(parsed)) return text;
  let next = parsed;
  if (props.min !== undefined) next = Math.max(props.min, next);
  if (props.max !== undefined) next = Math.min(props.max, next);
  if (props.precision !== undefined) return next.toFixed(props.precision);
  return String(next);
}

export function InputNumber({
  value,
  defaultValue,
  onChange,
  min,
  max,
  step = 1,
  precision,
  stringMode,
  controls = true,
  keyboard = true,
  formatter,
  parser,
  onBlur,
  onKeyDown,
  suffix,
  ...props
}: InputNumberProps) {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = React.useState(toText(defaultValue));
  const text = isControlled ? toText(value) : innerValue;
  const displayText = formatter ? formatter(text) : text;

  const emit = (nextText: string) => {
    if (!isControlled) setInnerValue(nextText);
    if (nextText === "") {
      onChange?.(null);
      return;
    }
    onChange?.(stringMode ? nextText : Number(nextText));
  };

  const commit = (rawText: string) => {
    const parsed = parser ? parser(rawText) : rawText;
    const next = normalizeNumberText(parsed, { min, max, precision });
    emit(next);
  };

  const stepBy = (direction: 1 | -1) => {
    const current = Number(parser ? parser(displayText) : text) || 0;
    commit(String(current + step * direction));
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={displayText}
      onValueChange={(next) => {
        const parsed = parser ? parser(next) : next;
        if (/^-?\d*(\.\d*)?$/.test(parsed) || parsed === "") {
          if (!isControlled) setInnerValue(parsed);
          onChange?.(parsed === "" ? null : stringMode ? parsed : Number(parsed));
        }
      }}
      onBlur={(event) => {
        commit(event.target.value);
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        if (keyboard && event.key === "ArrowUp") {
          event.preventDefault();
          stepBy(1);
        }
        if (keyboard && event.key === "ArrowDown") {
          event.preventDefault();
          stepBy(-1);
        }
        onKeyDown?.(event);
      }}
      suffix={
        <>
          {suffix}
          {controls ? (
            <span className="flex flex-col border-l">
              <button
                type="button"
                className="px-1 text-[10px] leading-3 hover:bg-accent"
                onClick={() => stepBy(1)}
              >
                ⌃
              </button>
              <button
                type="button"
                className="px-1 text-[10px] leading-3 hover:bg-accent"
                onClick={() => stepBy(-1)}
              >
                ⌄
              </button>
            </span>
          ) : null}
        </>
      }
    />
  );
}

InputNumber.displayName = "InputNumber";
