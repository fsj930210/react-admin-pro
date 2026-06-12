import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";
import {
  TimePicker,
  TimePickerHour,
  TimePickerMinute,
  TimePickerPanel,
  TimePickerSecond,
  TimePickerSeparator,
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
import { PickerFooter } from "./picker-footer";
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
  const timePanelTitle = value?.format("HH:mm") ?? "--:--";
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
    const base = value ?? mergedViewDate ?? dayjs();
    const parts = text.split(":");
    const nextHour = parts[0] && parts[0] !== "--" ? Number.parseInt(parts[0], 10) : base.hour();
    const nextMinute = parts[1] && parts[1] !== "--" ? Number.parseInt(parts[1], 10) : base.minute();
    const nextSecond = parts[2] && parts[2] !== "--" ? Number.parseInt(parts[2], 10) : base.second();

    if ([nextHour, nextMinute, nextSecond].some((item) => Number.isNaN(item))) return;
    commitValue(base.hour(nextHour).minute(nextMinute).second(nextSecond));
  });

  const handleInputCommit = useMemoizedFn((text: string) => {
    const parsed = parseValue(text, format);
    if (!parsed) return;
    commitValue(parsed);
  });

  return (
    <Popover open={openState} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
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
          className={cn("inline-flex w-full", className)}
          inputClassName={inputClassName}
          onValueChange={handleInputCommit}
          onOpenRequest={() => changeOpen(true)}
          onClear={() => {
            commitValue(null);
            onClear?.();
          }}
        />
      </PopoverTrigger>
      <PopoverContent className={cn("w-max max-w-none p-0", popupClassName)} align="start" sideOffset={0}>
        <div
          className={cn(
            "overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg",
            panelClassName,
          )}
        >
          <div className="flex">
            <div className="min-w-[320px]">
              <PickerPanel
                pickerMode="datetime"
                panelMode={panelMode}
                viewDate={mergedViewDate}
                value={value}
                disabledDate={disabledDate}
                footer={null}
                footerActions={false}
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
                className="rounded-none border-0 shadow-none"
              />
            </div>
            {showTime ? (
              <TimePicker
                value={timeValue}
                onValueChange={commitTime}
                disabled={disabled}
                readOnly={readOnly}
                disabledHours={timeDisabled.disabledHours}
                disabledMinutes={timeDisabled.disabledMinutes}
                disabledSeconds={timeDisabled.disabledSeconds}
              >
                <div className="w-[288px] shrink-0 border-l">
                  <div className="flex h-10 w-full items-center justify-center border-b text-sm font-medium">
                    {timePanelTitle}
                  </div>
                  <TimePickerPanel className="w-full">
                    <TimePickerHour className="h-[236px] w-24 shrink-0 px-1 [&>button]:h-8 [&>button]:shrink-0" />
                    <TimePickerSeparator className="hidden" />
                    <TimePickerMinute className="h-[236px] w-24 shrink-0 px-1 [&>button]:h-8 [&>button]:shrink-0" />
                    <TimePickerSeparator className="hidden" />
                    <TimePickerSecond className="h-[236px] w-24 shrink-0 px-1 [&>button]:h-8 [&>button]:shrink-0" />
                  </TimePickerPanel>
                </div>
              </TimePicker>
            ) : null}
          </div>
          <PickerFooter
            context={{
              mode: "single",
              pickerMode: "datetime",
              panelMode,
              viewDate: mergedViewDate,
              value,
              selectDate: commitDate,
              setPanelMode,
              setViewDate,
              close: () => changeOpen(false),
            }}
            footer={footer}
            actions={footerActions}
            onToday={() => commitDate(dayjs())}
            onClear={() => {
              commitValue(null);
              onClear?.();
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DateTimePicker };
