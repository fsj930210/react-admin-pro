import * as React from "react";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@rap/components-ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@rap/components-ui/popover";
import {
  TimePicker as UITimePicker,
  TimePickerContent,
  TimePickerHour,
  TimePickerInput,
  TimePickerInputGroup,
  TimePickerMinute,
  TimePickerSecond,
  TimePickerSeparator,
  TimePickerTrigger,
} from "@rap/components-ui/time-picker";
import { ProButton } from "../button";
import { cn } from "@rap/utils";

export type DateValue = Date | null;
export type DateRangeValue = [DateValue, DateValue];
export type ChangeMode = "change" | "confirm";

export interface DatePreset {
  label: React.ReactNode;
  value: () => DateRangeValue;
}

export const defaultRangePresets: DatePreset[] = [
  { label: "今天", value: () => [dayjs().startOf("day").toDate(), dayjs().endOf("day").toDate()] },
  {
    label: "昨天",
    value: () => [
      dayjs().subtract(1, "day").startOf("day").toDate(),
      dayjs().subtract(1, "day").endOf("day").toDate(),
    ],
  },
  {
    label: "最近 3 天",
    value: () => [
      dayjs().subtract(2, "day").startOf("day").toDate(),
      dayjs().endOf("day").toDate(),
    ],
  },
  {
    label: "最近 7 天",
    value: () => [
      dayjs().subtract(6, "day").startOf("day").toDate(),
      dayjs().endOf("day").toDate(),
    ],
  },
  {
    label: "最近 30 天",
    value: () => [
      dayjs().subtract(29, "day").startOf("day").toDate(),
      dayjs().endOf("day").toDate(),
    ],
  },
  {
    label: "本月",
    value: () => [dayjs().startOf("month").toDate(), dayjs().endOf("month").toDate()],
  },
];

function formatDate(date: DateValue, format = "YYYY-MM-DD") {
  return date ? dayjs(date).format(format) : "";
}

function formatRange(value: DateRangeValue | undefined, format = "YYYY-MM-DD") {
  if (!value?.[0] && !value?.[1]) return "";
  return `${formatDate(value?.[0] ?? null, format)} - ${formatDate(value?.[1] ?? null, format)}`;
}

export interface DatePickerProps {
  value?: DateValue;
  defaultValue?: DateValue;
  onChange?: (value: DateValue) => void;
  placeholder?: string;
  format?: string;
  className?: string;
}

export function DatePicker({
  value,
  defaultValue = null,
  onChange,
  placeholder = "请选择日期",
  format = "YYYY-MM-DD",
  className,
}: DatePickerProps) {
  const [innerValue, setInnerValue] = React.useState(defaultValue);
  const current = value !== undefined ? value : innerValue;
  const setValue = (next: DateValue) => {
    if (value === undefined) setInnerValue(next);
    onChange?.(next);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <ProButton
          variant="outline"
          className={cn(
            "w-full justify-between font-normal",
            !current && "text-muted-foreground",
            className
          )}
        >
          {current ? formatDate(current, format) : placeholder}
          <CalendarIcon className="size-4" />
        </ProButton>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={current ?? undefined}
          onSelect={(date) => setValue(date ?? null)}
        />
      </PopoverContent>
    </Popover>
  );
}

export interface RangePickerProps {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  onDraftChange?: (value: DateRangeValue) => void;
  placeholder?: string;
  format?: string;
  changeMode?: ChangeMode;
  showPresets?: boolean;
  presets?: DatePreset[];
  className?: string;
}

export function RangePicker({
  value,
  defaultValue = [null, null],
  onChange,
  onDraftChange,
  placeholder = "请选择日期范围",
  format = "YYYY-MM-DD",
  changeMode = "change",
  showPresets = true,
  presets = defaultRangePresets,
  className,
}: RangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [innerValue, setInnerValue] = React.useState<DateRangeValue>(defaultValue);
  const [draft, setDraft] = React.useState<DateRangeValue>(value ?? innerValue);
  const current = value !== undefined ? value : innerValue;

  React.useEffect(() => setDraft(current), [current]);

  const commit = (next: DateRangeValue) => {
    if (value === undefined) setInnerValue(next);
    onChange?.(next);
  };

  const updateDraft = (next: DateRangeValue) => {
    setDraft(next);
    onDraftChange?.(next);
    if (changeMode === "change") commit(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ProButton
          variant="outline"
          className={cn(
            "w-full justify-between font-normal",
            !current?.[0] && !current?.[1] && "text-muted-foreground",
            className
          )}
        >
          {formatRange(current, format) || placeholder}
          <CalendarIcon className="size-4" />
        </ProButton>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {showPresets ? (
            <div className="w-32 border-r p-2">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
                  onClick={() => updateDraft(preset.value())}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          ) : null}
          <div>
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={{ from: draft[0] ?? undefined, to: draft[1] ?? undefined }}
              onSelect={(range) => updateDraft([range?.from ?? null, range?.to ?? null])}
            />
            {changeMode === "confirm" ? (
              <div className="flex justify-end gap-2 border-t p-2">
                <ProButton
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDraft(current);
                    setOpen(false);
                  }}
                >
                  取消
                </ProButton>
                <ProButton
                  size="sm"
                  onClick={() => {
                    commit(draft);
                    setOpen(false);
                  }}
                >
                  确定
                </ProButton>
              </div>
            ) : null}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export interface TimePickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  showSeconds?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  changeMode?: ChangeMode;
  className?: string;
}

export function TimePicker({
  value,
  defaultValue,
  onChange,
  showSeconds = true,
  hourStep,
  minuteStep,
  secondStep,
  changeMode = "change",
  className,
}: TimePickerProps) {
  const [draft, setDraft] = React.useState(value ?? defaultValue ?? "");
  React.useEffect(() => {
    if (value !== undefined) setDraft(value);
  }, [value]);
  return (
    <UITimePicker
      value={changeMode === "confirm" ? draft : value}
      defaultValue={defaultValue}
      onValueChange={(next) => {
        setDraft(next);
        if (changeMode === "change") onChange?.(next);
      }}
      showSeconds={showSeconds}
      hourStep={hourStep}
      minuteStep={minuteStep}
      secondStep={secondStep}
      className={className}
    >
      <TimePickerInputGroup>
        <TimePickerInput segment="hour" />
        <TimePickerSeparator />
        <TimePickerInput segment="minute" />
        {showSeconds ? <TimePickerSeparator /> : null}
        {showSeconds ? <TimePickerInput segment="second" /> : null}
        <TimePickerTrigger />
      </TimePickerInputGroup>
      <TimePickerContent>
        <TimePickerHour />
        <TimePickerMinute />
        {showSeconds ? <TimePickerSecond /> : null}
        {changeMode === "confirm" ? (
          <div className="flex items-end border-l p-2">
            <ProButton size="sm" onClick={() => onChange?.(draft)}>
              确定
            </ProButton>
          </div>
        ) : null}
      </TimePickerContent>
    </UITimePicker>
  );
}

export interface TimeRangePickerProps extends Omit<
  TimePickerProps,
  "value" | "defaultValue" | "onChange"
> {
  value?: [string, string];
  defaultValue?: [string, string];
  onChange?: (value: [string, string]) => void;
}

export function TimeRangePicker({
  value,
  defaultValue = ["", ""],
  onChange,
  ...props
}: TimeRangePickerProps) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const update = (index: 0 | 1, next: string) => {
    const range: [string, string] = index === 0 ? [next, current[1]] : [current[0], next];
    if (value === undefined) setInner(range);
    onChange?.(range);
  };
  return (
    <div className="flex items-center gap-2">
      <TimePicker value={current[0]} onChange={(next) => update(0, next)} {...props} />
      <span className="text-muted-foreground text-sm">-</span>
      <TimePicker value={current[1]} onChange={(next) => update(1, next)} {...props} />
    </div>
  );
}
