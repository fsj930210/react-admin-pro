import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";
import { Popover, PopoverContent, PopoverTrigger } from "@rap/components-ui/popover";
import { cn } from "@rap/utils";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useRef, useState } from "react";
import { DEFAULT_FORMATS } from "./constants";
import { useRangePickerState } from "./hooks/use-date-picker-state";
import { usePickerPanelController } from "./hooks/use-picker-panel-controller";
import { PickerPanel } from "./picker-panel";
import { RangePickerTrigger } from "./range-picker-trigger";
import type { Dayjs, PickerPreset, RangePickerProps, RangeValue } from "./types";
import { formatValue, normalizeRange, parseValue } from "./utils";

dayjs.extend(customParseFormat);

function RangePicker(props: RangePickerProps) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    open,
    defaultOpen,
    onOpenChange,
    mode = "date",
    format,
    placeholder = ["Start date", "End date"],
    separator = "->",
    allowClear = true,
    allowEmpty,
    order = true,
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
    onCalendarChange,
    onSelect,
    onPanelChange,
    onClear,
  } = props;
  const fallbackViewDate = valueProp?.[0] ?? defaultValue?.[0] ?? dayjs();
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
    activePart,
    setActivePart,
  } = useRangePickerState(
    {
      value: valueProp,
      defaultValue: defaultValue ?? null,
      onChange,
      open,
      defaultOpen,
      onOpenChange,
      defaultPanelMode: "date",
      defaultViewDate: fallbackViewDate,
    },
    fallbackViewDate,
    "date",
  );
  const changeOpen = useMemoizedFn((next: boolean) => {
    if (disabled || readOnly) {
      return;
    }
    setOpen(next);
  });
  const [draftStart, setDraftStart] = useState<string | null>(null);
  const [draftEnd, setDraftEnd] = useState<string | null>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const mergedFormat = format ?? DEFAULT_FORMATS[mode] ?? DEFAULT_FORMATS.date;
  const startText = draftStart ?? formatValue(value?.[0] ?? null, mergedFormat, mergedFormat);
  const endText = draftEnd ?? formatValue(value?.[1] ?? null, mergedFormat, mergedFormat);
  const mergedViewDate = viewDate;
  const panelController = usePickerPanelController({
    panelMode,
    viewDate: mergedViewDate,
    setPanelMode,
    setViewDate,
  });

  const commitValue = useMemoizedFn((next: RangeValue) => {
    const normalized = normalizeRange(next, order);
    setValue(normalized as RangeValue);
    onSelect?.(normalized);
    onCalendarChange?.(normalized);
    if (normalized?.[0]) {
      setViewDate(normalized[0]);
    }
    setDraftStart(null);
    setDraftEnd(null);
  });

  const handleSelect = useMemoizedFn((date: Dayjs) => {
    if (disabledDate?.(date, { from: value?.[0] ?? undefined, type: mode })) return;

    const start = value?.[0] ?? null;
    const end = value?.[1] ?? null;

    if (activePart === "start" || !start || (start && end)) {
      let nextStart = date;
      if (mode === "month") nextStart = date.startOf("month");
      if (mode === "year") nextStart = date.startOf("year");
      if (mode === "quarter") nextStart = date.startOf("quarter");
      if (mode === "week") nextStart = date.startOf("isoWeek");
      const nextEnd = allowEmpty?.[1] ? end : null;
      commitValue([nextStart, nextEnd]);
      setHoverValue(null);
      setActivePart("end");
      queueMicrotask(() => endRef.current?.focus());
      return;
    }

    let nextEnd = date;
    if (mode === "month") nextEnd = date.startOf("month");
    if (mode === "year") nextEnd = date.startOf("year");
    if (mode === "quarter") nextEnd = date.startOf("quarter");
    if (mode === "week") nextEnd = date.startOf("isoWeek");
    commitValue([start, nextEnd]);
    setHoverValue(null);
  });

  const commitInput = useMemoizedFn((part: "start" | "end", text: string) => {
    const parsed = parseValue(text, mergedFormat);
    if (!parsed) return;

    if (part === "start") {
      commitValue([parsed, value?.[1] ?? null]);
      setViewDate(parsed);
      setActivePart("end");
      return;
    }

    commitValue([value?.[0] ?? null, parsed]);
    setViewDate(parsed);
  });

  const handleClear = useMemoizedFn(() => {
    setDraftStart(null);
    setDraftEnd(null);
    setHoverValue(null);
    commitValue(null);
    onClear?.();
  });

  const handlePresetPick = useMemoizedFn((preset: PickerPreset) => {
    const raw = typeof preset.value === "function" ? preset.value() : preset.value;
    if (!Array.isArray(raw)) return;
    commitValue([raw[0], raw[1]]);
  });

  return (
    <Popover open={openState} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <div className={cn("inline-flex w-full", className)}>
          <RangePickerTrigger
            open={openState}
            startValue={startText}
            endValue={endText}
            startPlaceholder={placeholder[0]}
            endPlaceholder={placeholder[1]}
            separator={separator}
            disabled={disabled}
            readOnly={readOnly}
            allowClear={allowClear}
            prefix={prefix}
            suffix={suffix}
            icon={icon}
            inputClassName={inputClassName}
            activePart={activePart}
            startRef={startRef}
            endRef={endRef}
            onStartChange={setDraftStart}
            onEndChange={setDraftEnd}
            onStartFocus={() => {
              setActivePart("start");
              changeOpen(true);
            }}
            onEndFocus={() => {
              setActivePart("end");
              changeOpen(true);
            }}
            onStartBlur={() => draftStart !== null && commitInput("start", draftStart)}
            onEndBlur={() => draftEnd !== null && commitInput("end", draftEnd)}
            onClear={handleClear}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0", popupClassName)} align="start" sideOffset={0}>
        <PickerPanel
          pickerMode={mode}
          panelMode={panelMode}
          viewDate={mergedViewDate}
          value={value}
          hoverValue={hoverValue}
          disabledDate={disabledDate}
          presets={presets}
          footer={footer}
          footerActions={footerActions}
          renderCell={renderCell}
          renderPanel={renderPanel}
          onSelect={handleSelect}
          onHover={setHoverValue}
          onToday={() => handleSelect(dayjs())}
          onClear={handleClear}
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
          numberOfMonths={2}
          activeRangePart={activePart}
          className={panelClassName}
        />
      </PopoverContent>
    </Popover>
  );
}

export { RangePicker };
