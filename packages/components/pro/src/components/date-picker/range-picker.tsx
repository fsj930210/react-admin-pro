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
import { formatPickerValue, normalizeRange, parseValue } from "./utils";

dayjs.extend(customParseFormat);

function getRangePanelMode(mode: RangePickerProps["mode"]) {
  if (mode === "year") return "year";
  if (mode === "month") return "month";
  if (mode === "quarter") return "quarter";
  return "date";
}

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
    separator,
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
  const defaultPanelMode = getRangePanelMode(mode);
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
      defaultPanelMode,
      defaultViewDate: fallbackViewDate,
    },
    fallbackViewDate,
    defaultPanelMode,
  );
  const changeOpen = useMemoizedFn((next: boolean) => {
    if (disabled || readOnly) {
      return;
    }
    setOpen(next);
  });
  const [draftStart, setDraftStart] = useState<string | null>(null);
  const [draftEnd, setDraftEnd] = useState<string | null>(null);
  const [panelValue, setPanelValue] = useState<RangeValue>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const mergedFormat = format ?? DEFAULT_FORMATS[mode] ?? DEFAULT_FORMATS.date;
  const startText = draftStart ?? formatPickerValue(value?.[0] ?? null, mode, format, mergedFormat);
  const endText = draftEnd ?? formatPickerValue(value?.[1] ?? null, mode, format, mergedFormat);
  const mergedViewDate = viewDate;
  const panelController = usePickerPanelController({
    panelMode,
    viewDate: mergedViewDate,
    setPanelMode,
    setViewDate,
  });

  const getModeDate = useMemoizedFn((date: Dayjs) => {
    if (mode === "month") return date.startOf("month");
    if (mode === "year") return date.startOf("year");
    if (mode === "quarter") return date.startOf("quarter");
    if (mode === "week") return date.startOf("week");
    return date;
  });

  const basePickerValue = panelValue ?? value;
  let pickerValue = basePickerValue;

  if (hoverValue && basePickerValue?.[0] && basePickerValue?.[1]) {
    pickerValue =
      activePart === "start"
        ? (normalizeRange([getModeDate(hoverValue), basePickerValue[1]], order) as RangeValue)
        : (normalizeRange([basePickerValue[0], getModeDate(hoverValue)], order) as RangeValue);
  }

  const commitValue = useMemoizedFn((next: RangeValue) => {
    const normalized = normalizeRange(next, order);
    setPanelValue(null);
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
    if (disabledDate?.(date, { from: pickerValue?.[0] ?? undefined, type: mode })) return;

    const start = pickerValue?.[0] ?? null;
    const end = pickerValue?.[1] ?? null;
    const modeDate = getModeDate(date);

    if (activePart === "start" || !start || (start && end)) {
      const nextValue: RangeValue = [modeDate, null];
      if (allowEmpty?.[1]) {
        commitValue(nextValue);
      } else {
        setPanelValue(nextValue);
        onCalendarChange?.(nextValue);
      }
      setHoverValue(null);
      setActivePart("end");
      queueMicrotask(() => endRef.current?.focus());
      return;
    }

    commitValue([start, modeDate]);
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
    setPanelValue(null);
    commitValue(null);
    onClear?.();
  });

  const handlePresetPick = useMemoizedFn((preset: PickerPreset) => {
    const raw = typeof preset.value === "function" ? preset.value() : preset.value;
    if (!Array.isArray(raw)) return;
    commitValue([raw[0], raw[1]]);
  });

  return (
    <Popover
      open={openState}
      onOpenChange={(next) => {
        if (next) {
          setPanelValue(value);
        } else {
          setPanelValue(null);
          setHoverValue(null);
        }
        changeOpen(next);
      }}
    >
      <PopoverTrigger asChild>
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
          className={cn("inline-flex w-full", className)}
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
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[var(--radix-popover-trigger-width)] min-w-[560px] p-0", popupClassName)}
        align="start"
        sideOffset={0}
      >
        <PickerPanel
          pickerMode={mode}
          panelMode={panelMode}
          viewDate={mergedViewDate}
          value={pickerValue}
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
