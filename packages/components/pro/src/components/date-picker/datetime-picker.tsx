import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";
import {
  TimePicker,
  TimePickerContent,
  TimePickerHour,
  TimePickerInput,
  TimePickerInputGroup,
  TimePickerMinute,
  TimePickerSecond,
  TimePickerSeparator,
  TimePickerTrigger,
} from "@rap/components-ui/time-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@rap/components-ui/popover";
import { cn } from "@rap/utils";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useMemo } from "react";
import { DEFAULT_FORMATS } from "./constants";
import { useSinglePickerState } from "./hooks/use-date-picker-state";
import { usePickerPanelController } from "./hooks/use-picker-panel-controller";
import { PickerPanel } from "./picker-panel";
import { PickerTrigger } from "./picker-trigger";
import type { DateTimePickerProps, Dayjs } from "./types";
import { formatValue, parseValue } from "./utils";

dayjs.extend(customParseFormat);

function DateTimePicker(props: DateTimePickerProps) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    open,
    defaultOpen,
    onOpenChange,
    format = DEFAULT_FORMATS.datetime,
    placeholder = "Select date time",
    showTime = true,
    allowClear = true,
    disabled,
    readOnly,
    prefix,
    suffix,
    icon,
    disabledDate,
    disabledTime,
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
  const fallbackViewDate = valueProp ?? defaultValue ?? dayjs();
  const { value, setValue, open: openState, setOpen, panelMode, setPanelMode, viewDate, setViewDate } =
    useSinglePickerState(
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

  const inputValue = formatValue(value, format, DEFAULT_FORMATS.datetime);
  const timeValue = value?.format("HH:mm:ss") ?? "00:00:00";
  const mergedViewDate = viewDate;
  const panelController = usePickerPanelController({
    panelMode,
    viewDate: mergedViewDate,
    setPanelMode,
    setViewDate,
  });

  const timeDisabled = useMemo(() => {
    if (!disabledTime) {
      return {
        disabledHours: undefined,
        disabledMinutes: undefined,
        disabledSeconds: undefined,
      };
    }
    const result = disabledTime(mergedViewDate);
    return {
      disabledHours: result.disabledHours,
      disabledMinutes: result.disabledMinutes,
      disabledSeconds: result.disabledSeconds,
    };
  }, [disabledTime, mergedViewDate]);

  const commitValue = useMemoizedFn((next: Dayjs | null) => {
    setValue(next);
    onSelect?.(next);
    if (next) {
      setViewDate(next);
    }
  });

  const commitDate = useMemoizedFn((date: Dayjs) => {
    if (disabledDate?.(date, { type: "datetime" })) return;
    const base = value ?? mergedViewDate ?? dayjs();
    const next = date.hour(base.hour()).minute(base.minute()).second(base.second()).millisecond(base.millisecond());
    commitValue(next);
  });

  const commitTime = useMemoizedFn((text: string) => {
    const parsed = dayjs(text, "HH:mm:ss", true);
    if (!parsed.isValid()) return;
    const base = value ?? mergedViewDate ?? dayjs();
    commitValue(base.hour(parsed.hour()).minute(parsed.minute()).second(parsed.second()));
  });

  const handleInputCommit = useMemoizedFn((text: string) => {
    const parsed = parseValue(text, format);
    if (!parsed) return;
    commitValue(parsed);
  });

  return (
    <Popover open={openState} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <div className={cn("inline-flex w-full", className)}>
          <PickerTrigger
            open={openState}
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            allowClear={allowClear}
            prefix={prefix}
            suffix={suffix}
            icon={icon}
            inputClassName={inputClassName}
            onValueChange={handleInputCommit}
            onOpenRequest={() => changeOpen(true)}
            onClear={() => {
              commitValue(null);
              onClear?.();
            }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0", popupClassName)} align="start" sideOffset={0}>
        <div className={cn("overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg", panelClassName)}>
          <PickerPanel
            pickerMode="datetime"
            panelMode={panelMode}
            viewDate={mergedViewDate}
            value={value}
            disabledDate={disabledDate}
            footer={footer}
            footerActions={footerActions}
            renderCell={renderCell}
            renderPanel={renderPanel}
            onSelect={commitDate}
            onToday={() => commitDate(dayjs())}
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
            onPresetPick={() => undefined}
            close={() => changeOpen(false)}
            setPanelMode={(next) => {
              panelController.setPanelMode(next);
              onPanelChange?.(next, mergedViewDate);
            }}
            setViewDate={(date) => {
              setViewDate(date);
              onPanelChange?.(panelMode, date);
            }}
          />
          {showTime ? (
            <div className="border-t p-3">
              <TimePicker
                value={timeValue}
                onValueChange={commitTime}
                openOnFocus
                disabled={disabled}
                readOnly={readOnly}
                disabledHours={timeDisabled.disabledHours}
                disabledMinutes={timeDisabled.disabledMinutes}
                disabledSeconds={timeDisabled.disabledSeconds}
              >
                <TimePickerInputGroup className="flex items-center gap-1">
                  <TimePickerInput />
                  <TimePickerTrigger />
                </TimePickerInputGroup>
                <TimePickerContent className="w-auto">
                  <div className="flex items-center gap-1 p-1">
                    <TimePickerHour />
                    <TimePickerSeparator />
                    <TimePickerMinute />
                    <TimePickerSeparator />
                    <TimePickerSecond />
                  </div>
                </TimePickerContent>
              </TimePicker>
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DateTimePicker };
