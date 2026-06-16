import {
  isValidElement,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Minus, Plus, XCircle } from "lucide-react";
import { useTranslation } from "@rap/i18n";
import { Input as UIInput } from "@rap/components-ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@rap/components-ui/input-group";
import { Space } from "@rap/components-ui/space";
import { Choose, Otherwise, When } from "@rap/components-ui/when";
import { cn } from "@rap/utils";
import { useControllableState } from "@rap/hooks/use-controllable-state";
import * as React from "react";

export interface InputAffixRenderContext {
  value: string;
  focused: boolean;
  disabled: boolean;
  showClear: boolean;
  clear: () => void;
  clearIcon: React.ReactNode;
}

export type InputAffix = React.ReactNode | ((ctx: InputAffixRenderContext) => React.ReactNode);

function InputClearButton({
  clearIcon,
  onClear,
}: {
  clearIcon: React.ReactNode;
  onClear: () => void;
}) {
  const { t } = useTranslation("pro");

  return (
    <InputGroupButton
      size="icon-xs"
      aria-label={t("input.clear")}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={onClear}
      className="rounded-full"
    >
      {clearIcon}
    </InputGroupButton>
  );
}

export type InputProps = Omit<React.ComponentProps<typeof UIInput>, "suffix" | "prefix"> & {
  prefix?: InputAffix;
  suffix?: InputAffix;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  rootClassName?: string;
  allowClear?: boolean | { icon?: React.ReactNode };
  onClear?: () => void;
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export function Input({
  ref,
  value,
  defaultValue,
  onChange,
  onClear,
  onPressEnter,
  prefix,
  suffix,
  addonAfter,
  addonBefore,
  allowClear,
  className,
  rootClassName,
  disabled,
  ...props
}: InputProps) {
  const [val, setVal] = useControllableState({ value, defaultValue, onChange });
  const hasIcon = !!prefix || !!suffix || !!allowClear;
  const clearIcon =
    typeof allowClear !== "boolean" && allowClear?.icon ? allowClear.icon : <XCircle />;
  const hasAddon = !!addonBefore || !!addonAfter;
  const [focused, setFocused] = React.useState(false);
  const showClear = !!allowClear && !!val && !disabled && (!suffix || focused);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onPressEnter?.(event);
    }
    props.onKeyDown?.(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVal(event.target.value, event);
  };

  const handleClear = () => {
    setVal("");
    onClear?.();
  };

  const affixContext: InputAffixRenderContext = {
    value: String(val ?? ""),
    focused,
    disabled: !!disabled,
    showClear,
    clear: handleClear,
    clearIcon,
  };

  const renderAffix = (affix: InputAffix | undefined) => {
    if (typeof affix === "function") {
      return affix(affixContext);
    }
    return affix;
  };

  const renderAddon = (addon: React.ReactNode) => {
    if (React.isValidElement(addon)) {
      return addon;
    }
    return <Space.Addon>{addon}</Space.Addon>;
  };

  const suffixContent =
    typeof suffix === "function" ? (
      renderAffix(suffix)
    ) : (
      <When condition={showClear} fallback={renderAffix(suffix)}>
        <InputClearButton clearIcon={clearIcon} onClear={handleClear} />
      </When>
    );

  const control = (
    <Choose>
      <When condition={!hasIcon}>
        <UIInput
          {...props}
          className={cn(className, !hasAddon && rootClassName, hasAddon && "flex-1")}
          disabled={disabled}
          ref={ref}
          value={val ?? ""}
          onChange={handleChange}
          onFocus={(e) => {
            setFocused(true);
            props?.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props?.onBlur?.(e);
          }}
          onKeyDown={handleKeyDown}
        />
      </When>
      <Otherwise>
        <InputGroup className={cn(!hasAddon && rootClassName)}>
          <When condition={!!prefix}>
            <InputGroupAddon align="inline-start">{renderAffix(prefix)}</InputGroupAddon>
          </When>
          <InputGroupInput
            {...props}
            className={cn(className, "peer")}
            disabled={disabled}
            ref={ref}
            value={val ?? ""}
            onFocus={(e) => {
              setFocused(true);
              props?.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props?.onBlur?.(e);
            }}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <When condition={!!suffix || showClear}>
            <InputGroupAddon align="inline-end">{suffixContent}</InputGroupAddon>
          </When>
        </InputGroup>
      </Otherwise>
    </Choose>
  );

  return (
    <Choose>
      <When condition={hasAddon}>
        <Space.Compact block className={rootClassName}>
          <When condition={!!addonBefore}>{renderAddon(addonBefore)}</When>
          {control}
          <When condition={!!addonAfter}>{renderAddon(addonAfter)}</When>
        </Space.Compact>
      </When>
      <Otherwise>{control}</Otherwise>
    </Choose>
  );
}

Input.displayName = "Input";

export interface VisibilityToggle {
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

export interface PasswordInputProps extends Omit<InputProps, "type"> {
  iconRender?: (visible: boolean) => React.ReactNode;
  visibilityToggle?: boolean | VisibilityToggle;
}

export function PasswordInput(props: PasswordInputProps) {
  const { iconRender, visibilityToggle = true, suffix, disabled, ...restProps } = props;
  const [innerVisible, setInnerVisible] = React.useState(false);
  const visibilityToggleConfig =
    typeof visibilityToggle === "object" ? visibilityToggle : undefined;
  const visibleProp = visibilityToggleConfig?.visible;
  const visible = visibleProp ?? innerVisible;
  const visibleIcon = iconRender ? iconRender(visible) : visible ? <Eye /> : <EyeOff />;
  const showVisibilityToggle = visibilityToggle !== false;

  const handleVisibleChange = () => {
    const next = !visible;

    if (visibleProp === undefined) {
      setInnerVisible(next);
    }
    visibilityToggleConfig?.onVisibleChange?.(next);
  };

  return (
    <Input
      {...restProps}
      disabled={disabled}
      type={visible ? "text" : "password"}
      suffix={(ctx) => (
        <Space size="xs" className="min-w-0">
          <When
            condition={ctx.showClear}
            fallback={typeof suffix === "function" ? suffix(ctx) : suffix}
          >
            <InputClearButton clearIcon={ctx.clearIcon} onClear={ctx.clear} />
          </When>
          <When condition={showVisibilityToggle}>
            <InputGroupButton
              size="icon-xs"
              aria-label={visible ? "Hide password" : "Show password"}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={handleVisibleChange}
              disabled={disabled}
            >
              {visibleIcon}
            </InputGroupButton>
          </When>
        </Space>
      )}
    />
  );
}

export interface NumberInputProps extends Omit<
  InputProps,
  "value" | "defaultValue" | "onChange" | "type" | "allowClear" | "onClear"
> {
  value?: number;
  defaultValue?: number;
  onChange?: (value?: number) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  formatter?: (value?: number) => string;
  parser?: (input: string) => number | undefined;
  keyboard?: boolean;
  controls?: boolean | { upIcon?: React.ReactNode; downIcon?: React.ReactNode };
  mode?: "input" | "spinner";
  onStep?: (
    value: number,
    info: {
      offset: number;
      type: "up" | "down";
    }
  ) => void;
}

type MaybeNumber = number | undefined;

function defaultParseNumber(input: string): MaybeNumber {
  if (!canParseNumber(input)) return undefined;

  const next = Number(input);
  return Number.isFinite(next) ? next : undefined;
}

function sanitizeNumberInput(input: string) {
  let next = input.replace(/[^\d.-]/g, "");
  const isNegative = next.startsWith("-");

  next = next.replace(/-/g, "");

  if (isNegative) {
    next = `-${next}`;
  }

  const [integer = "", ...decimalParts] = next.split(".");

  return decimalParts.length ? `${integer}.${decimalParts.join("")}` : integer;
}

function canParseNumber(input: string) {
  return input.trim() !== "" && Number.isFinite(Number(input));
}

function getPrecision(value: number) {
  const valueString = String(value);
  const decimalIndex = valueString.indexOf(".");

  return decimalIndex >= 0 ? valueString.length - decimalIndex - 1 : 0;
}

function formatNumberValue(value: MaybeNumber, precision?: number) {
  if (value === undefined) return "";
  if (precision === undefined) return String(value);
  return value.toFixed(precision);
}

export function NumberInput({
  value,
  defaultValue,
  onChange,
  min,
  max,
  step = 1,
  precision,
  formatter,
  parser = defaultParseNumber,
  keyboard = true,
  controls,
  mode = "input",
  onStep,
  onBlur,
  onKeyDown,
  readOnly,
  disabled,
  ...props
}: NumberInputProps) {
  const [numberValue, setNumberValue] = useControllableState<MaybeNumber>({
    value,
    defaultValue,
    onChange,
  });
  const [inputValue, setInputValue] = React.useState(() =>
    formatter ? formatter(numberValue) : formatNumberValue(numberValue, precision)
  );
  const [focused, setFocused] = React.useState(false);
  const isOutOfRange =
    numberValue !== undefined &&
    ((min !== undefined && numberValue < min) || (max !== undefined && numberValue > max));

  const normalizeValue = (next: MaybeNumber) => {
    if (next === undefined) return undefined;

    let normalized = next;

    if (min !== undefined && normalized < min) {
      normalized = min;
    }
    if (max !== undefined && normalized > max) {
      normalized = max;
    }
    if (precision !== undefined) {
      normalized = Number(normalized.toFixed(precision));
    }

    return normalized;
  };

  const updateValue = (next: MaybeNumber) => {
    const normalized = normalizeValue(next);
    setNumberValue(normalized);

    return normalized;
  };

  const formatInputValue = (next: MaybeNumber) => {
    return formatter ? formatter(next) : formatNumberValue(next, precision);
  };

  const handleChange = (next: string | React.ChangeEvent<HTMLInputElement>) => {
    const nextInput = sanitizeNumberInput(typeof next === "string" ? next : next.target.value);

    setInputValue(nextInput);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    const next = updateValue(parser(inputValue));
    setInputValue(formatInputValue(next));
    onBlur?.(event);
  };

  const handleStep = (type: "up" | "down") => {
    if (disabled || readOnly) return;

    const current = canParseNumber(inputValue)
      ? (parser(inputValue) ?? min ?? 0)
      : (numberValue ?? min ?? 0);
    const offset = type === "up" ? step : -step;
    const stepPrecision = Math.max(
      getPrecision(current),
      getPrecision(Number(step)),
      precision ?? 0
    );
    const next = normalizeValue(Number((current + offset).toFixed(stepPrecision))) ?? current;

    setNumberValue(next);
    setInputValue(formatInputValue(next));
    onStep?.(next, { offset, type });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (keyboard) {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        handleStep("up");
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        handleStep("down");
      }
    }

    onKeyDown?.(event);
  };

  const controlsConfig = typeof controls === "object" ? controls : undefined;
  const showControls = controls !== false;
  const canStepDown =
    !disabled && !readOnly && (min === undefined || (parser(inputValue) ?? numberValue ?? 0) > min);
  const canStepUp =
    !disabled && !readOnly && (max === undefined || (parser(inputValue) ?? numberValue ?? 0) < max);
  const controlSuffix = showControls ? (
    <div
      className={cn(
        "pointer-events-none absolute top-0 right-0 flex h-full w-7 flex-col overflow-hidden rounded-r-md border-l border-input bg-background opacity-0 transition-opacity group-hover/input-group:pointer-events-auto group-hover/input-group:opacity-100",
        focused && "pointer-events-auto opacity-100"
      )}
    >
      <InputGroupButton
        size="icon-xs"
        className="h-auto w-full flex-1 rounded-none p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3"
        disabled={!canStepUp}
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={() => {
          handleStep("up");
        }}
      >
        {controlsConfig?.upIcon ?? <ChevronUp className="size-3" />}
      </InputGroupButton>
      <InputGroupButton
        size="icon-xs"
        className="h-auto w-full flex-1 rounded-none border-t border-input p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3"
        disabled={!canStepDown}
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={() => {
          handleStep("down");
        }}
      >
        {controlsConfig?.downIcon ?? <ChevronDown className="size-3" />}
      </InputGroupButton>
    </div>
  ) : null;
  const input = (
    <Input
      {...props}
      disabled={disabled}
      readOnly={readOnly}
      rootClassName={mode === "spinner" ? undefined : props.rootClassName}
      value={inputValue}
      type="text"
      inputMode="decimal"
      aria-invalid={props["aria-invalid"] || isOutOfRange || undefined}
      suffix={
        mode === "input" && (showControls || props.suffix)
          ? (ctx) => (
              <Space size="xs" className="min-w-0">
                {typeof props.suffix === "function" ? props.suffix(ctx) : props.suffix}
                {controlSuffix}
              </Space>
            )
          : props.suffix
      }
      onChange={handleChange}
      onFocus={(event) => {
        setFocused(true);
        props.onFocus?.(event);
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );

  return (
    <Choose>
      <When condition={mode === "spinner" && showControls}>
        <Space.Compact block className={props.rootClassName}>
          <InputGroupButton
            variant="outline"
            size="icon-sm"
            disabled={!canStepDown}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={() => {
              handleStep("down");
            }}
          >
            {controlsConfig?.downIcon ?? <Minus />}
          </InputGroupButton>
          {input}
          <InputGroupButton
            variant="outline"
            size="icon-sm"
            disabled={!canStepUp}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={() => {
              handleStep("up");
            }}
          >
            {controlsConfig?.upIcon ?? <Plus />}
          </InputGroupButton>
        </Space.Compact>
      </When>
      <Otherwise>{input}</Otherwise>
    </Choose>
  );
}
