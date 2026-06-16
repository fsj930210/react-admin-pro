import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";
import { Popover, PopoverContent, PopoverTrigger } from "@rap/components-ui/popover";
import { cn } from "@rap/utils";
import dayjs from "dayjs";
import { DEFAULT_FORMATS } from "./constants";
import { useSinglePickerState } from "./hooks/use-date-picker-state";
import { usePickerPanelController } from "./hooks/use-picker-panel-controller";
import { PickerPanel } from "./picker-panel";
import { PickerTrigger } from "./picker-trigger";
import type {
  DatePickerProps,
  Dayjs,
  MultipleValue,
  PickerMode,
  PickerPanelMode,
  PickerPreset,
} from "./types";
import { formatPickerValue, parseValue, sameDay } from "./utils";
import { useState } from "react";

function getDefaultPanelMode(mode: PickerMode): PickerPanelMode {
  if (mode === "year") return "year";
  if (mode === "month") return "month";
  if (mode === "quarter") return "quarter";
  return "date";
}

function DatePicker(props: DatePickerProps) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    open,
    defaultOpen,
    onOpenChange,
    mode = "date",
    multiple = false,
    format,
    placeholder = "Select date",
    allowClear = true,
    disabled,
    readOnly,
    prefix,
    suffix,
    icon,
    disabledDate,
    presets,
    footer,
    footerActions,
    renderCell,
    renderPanel,
    className,
    inputClassName,
    popupClassName,
    panelClassName,
    onSelect,
    onPanelChange,
    onClear,
  } = props;
  const multipleDates = multiple && mode === "date";
  const {
    value,
    setValue,
    open: openState,
    setOpen,
    panelMode,
    setPanelMode,
    viewDate,
    setViewDate,
    hoverValue,
    setHoverValue,
  } = useSinglePickerState<Dayjs | MultipleValue | null>(
    {
      value: valueProp,
      defaultValue: defaultValue ?? (multipleDates ? [] : null),
      onChange,
      open,
      defaultOpen,
      onOpenChange,
      defaultPanelMode: getDefaultPanelMode(mode),
      defaultViewDate: Array.isArray(valueProp)
        ? (valueProp[0] ?? dayjs())
        : Array.isArray(defaultValue)
          ? (defaultValue[0] ?? dayjs())
          : (valueProp ?? defaultValue ?? dayjs()),
    },
    Array.isArray(valueProp)
      ? (valueProp[0] ?? dayjs())
      : Array.isArray(defaultValue)
        ? (defaultValue[0] ?? dayjs())
        : (valueProp ?? defaultValue ?? dayjs()),
    getDefaultPanelMode(mode)
  );
  const changeOpen = useMemoizedFn((next: boolean) => {
    if (disabled || readOnly) {
      return;
    }
    setOpen(next);
  });
  const [draftText, setDraftText] = useState<string | null>(null);

  const mergedFormat = format ?? DEFAULT_FORMATS[mode] ?? DEFAULT_FORMATS.date;
  const displayFormat = Array.isArray(mergedFormat) ? mergedFormat[0] : mergedFormat;
  const displayText =
    draftText ??
    (multipleDates && Array.isArray(value)
      ? value.map((item) => formatPickerValue(item, mode, format, displayFormat)).join(", ")
      : formatPickerValue(Array.isArray(value) ? null : value, mode, format, displayFormat));
  const mergedViewDate = viewDate;
  const panelController = usePickerPanelController({
    panelMode,
    viewDate: mergedViewDate,
    setPanelMode,
    setViewDate,
  });

  const commitValue = useMemoizedFn((next: Dayjs | MultipleValue | null) => {
    setValue(next);
    onSelect?.(next);
    if (Array.isArray(next)) {
      if (next[0]) {
        setViewDate(next[0]);
      }
    } else if (next) {
      setViewDate(next);
    }
    setDraftText(null);
  });

  const handleSelect = useMemoizedFn((date: Dayjs) => {
    if (disabledDate?.(date, { type: mode })) return;
    let next = date;
    if (mode === "month") next = date.startOf("month");
    if (mode === "year") next = date.startOf("year");
    if (mode === "quarter") next = date.startOf("quarter");
    if (mode === "week") next = date.startOf("week");
    if (multipleDates) {
      const current = Array.isArray(value) ? value : [];
      const exists = current.some((item) => sameDay(item, next));
      commitValue(exists ? current.filter((item) => !sameDay(item, next)) : [...current, next]);
      return;
    }
    commitValue(next);
    if (mode !== "month" && mode !== "year" && mode !== "quarter") {
      changeOpen(false);
    }
  });

  const handlePresetPick = useMemoizedFn((preset: PickerPreset) => {
    const raw = typeof preset.value === "function" ? preset.value() : preset.value;
    if (Array.isArray(raw)) return;
    commitValue(raw);
    changeOpen(false);
  });

  const handleInputChange = useMemoizedFn((text: string) => {
    setDraftText(text);
    const next = parseValue(text, mergedFormat);
    if (!next) return;
    setViewDate(next);
    if (multipleDates) {
      setValue([next]);
      onSelect?.([next]);
      return;
    }
    setValue(next);
    onSelect?.(next);
  });

  return (
    <Popover open={openState} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <PickerTrigger
          open={openState}
          value={displayText}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          allowClear={allowClear}
          prefix={prefix}
          suffix={suffix}
          icon={icon}
          className={cn("inline-flex w-full", className)}
          inputClassName={inputClassName}
          onValueChange={handleInputChange}
          onOpenRequest={() => changeOpen(true)}
          onClear={() => {
            commitValue(null);
            onClear?.();
          }}
        />
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0", popupClassName)}
        align="start"
        sideOffset={0}
      >
        <PickerPanel
          pickerMode={mode}
          panelMode={panelMode}
          viewDate={mergedViewDate}
          value={value}
          multiple={multipleDates}
          disabledDate={disabledDate}
          presets={presets}
          footer={footer}
          footerActions={footerActions}
          renderCell={renderCell}
          renderPanel={renderPanel}
          onSelect={handleSelect}
          onHover={setHoverValue}
          hoverValue={hoverValue}
          onToday={() => handleSelect(dayjs())}
          onClear={() => {
            commitValue(null);
            onClear?.();
          }}
          onPrevMonth={() => panelController.addMonth(-1)}
          onNextMonth={() => panelController.addMonth(1)}
          onPrevYear={() => panelController.addYear(-1)}
          onNextYear={() => panelController.addYear(1)}
          onPrevDecade={() => panelController.addYears(-10)}
          onNextDecade={() => panelController.addYears(10)}
          onPresetPick={handlePresetPick}
          close={() => changeOpen(false)}
          setPanelMode={(next) => {
            panelController.setPanelMode(next);
            onPanelChange?.(next, mergedViewDate);
          }}
          setViewDate={(date) => {
            setViewDate(date);
            onPanelChange?.(panelMode, date);
          }}
          className={panelClassName}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
