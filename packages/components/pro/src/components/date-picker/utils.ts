import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { MONTHS, QUARTERS } from "./constants";
import type { PickerCellRenderInfo, PickerMode, RangeValue } from "./types";

dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
dayjs.extend(quarterOfYear);
dayjs.extend(customParseFormat);

export { dayjs };

export function isDayjs(value: unknown): value is dayjs.Dayjs {
  return !!value && typeof value === "object" && "isValid" in value && "format" in value;
}

export function sameDay(a: dayjs.Dayjs | null | undefined, b: dayjs.Dayjs | null | undefined) {
  return !!a && !!b && a.isSame(b, "day");
}

export function sameMonth(a: dayjs.Dayjs | null | undefined, b: dayjs.Dayjs | null | undefined) {
  return !!a && !!b && a.isSame(b, "month");
}

export function sameYear(a: dayjs.Dayjs | null | undefined, b: dayjs.Dayjs | null | undefined) {
  return !!a && !!b && a.isSame(b, "year");
}

export function sameQuarter(a: dayjs.Dayjs | null | undefined, b: dayjs.Dayjs | null | undefined) {
  return !!a && !!b && a.quarter() === b.quarter() && a.isSame(b, "year");
}

export function normalizeRange(
  value: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
  order = true,
) {
  if (!value) return null;
  const [start, end] = value;
  if (!start && !end) return null;
  if (!start || !end) return [start, end] as const;
  if (!order || start.isBefore(end) || start.isSame(end)) return [start, end] as const;
  return [end, start] as const;
}

export function mergeTime(base: dayjs.Dayjs, time: dayjs.Dayjs) {
  return base
    .hour(time.hour())
    .minute(time.minute())
    .second(time.second())
    .millisecond(time.millisecond());
}

export function getYearPageStart(year: number) {
  return Math.floor(year / 12) * 12;
}

export function buildYearGrid(viewDate: dayjs.Dayjs) {
  const start = getYearPageStart(viewDate.year());
  return Array.from({ length: 12 }, (_, index) => start + index);
}

export function buildMonthGrid() {
  return Array.from({ length: 12 }, (_, index) => index);
}

export function buildQuarterGrid() {
  return Array.from({ length: 4 }, (_, index) => index + 1);
}

export function buildDateGrid(viewDate: dayjs.Dayjs) {
  const startOfMonth = viewDate.startOf("month");
  const start = startOfMonth.startOf("week");
  return Array.from({ length: 42 }, (_, index) => start.add(index, "day"));
}

export function formatValue(value: dayjs.Dayjs | null, format: string | string[] | undefined, fallback: string) {
  if (!value) return "";
  const formats = Array.isArray(format) ? format : format ? [format] : [fallback];
  return value.format(formats[0]);
}

export function formatPickerValue(
  value: dayjs.Dayjs | null,
  pickerMode: PickerMode,
  format: string | string[] | undefined,
  fallback: string,
) {
  if (!value) return "";
  if (pickerMode === "week" && !format) {
    return `${value.year()}年第${value.week()}周`;
  }
  return formatValue(value, format, fallback);
}

export function parseValue(text: string, format: string | string[] | undefined) {
  const formats = Array.isArray(format) ? format : format ? [format] : [];
  if (formats.length === 0) return dayjs(text).isValid() ? dayjs(text) : null;
  for (const item of formats) {
    const parsed = dayjs(text, item, true);
    if (parsed.isValid()) return parsed;
  }
  return null;
}

export function buildMonthCellInfos(
  viewDate: dayjs.Dayjs,
  value: dayjs.Dayjs | RangeValue | null,
  pickerMode: PickerMode,
  disabledDate: ((current: dayjs.Dayjs, info: { from?: dayjs.Dayjs; type: PickerMode }) => boolean) | undefined,
  onSelect: (date: dayjs.Dayjs) => void,
) {
  const start = Array.isArray(value) ? value[0] : value;
  const end = Array.isArray(value) ? value[1] : null;

  return buildMonthGrid().map((month) => {
    const current = viewDate.month(month);
    const info: PickerCellRenderInfo = {
      date: current,
      text: MONTHS[month],
      type: pickerMode,
      selected: (!!start && current.isSame(start, "month")) || (!!end && current.isSame(end, "month")),
      disabled: disabledDate?.(current, { from: start ?? undefined, type: "month" }) ?? false,
      today: false,
      inView: true,
      rangeStart: !!start && current.isSame(start, "month"),
      rangeEnd: !!end && current.isSame(end, "month"),
      rangeMiddle: !!start && !!end && current.isAfter(start, "month") && current.isBefore(end, "month"),
      onSelect: () => onSelect(current),
    };

    return { key: month, info };
  });
}

export function buildYearCellInfos(
  viewDate: dayjs.Dayjs,
  value: dayjs.Dayjs | RangeValue | null,
  pickerMode: PickerMode,
  disabledDate: ((current: dayjs.Dayjs, info: { from?: dayjs.Dayjs; type: PickerMode }) => boolean) | undefined,
  onSelect: (date: dayjs.Dayjs) => void,
) {
  const start = Array.isArray(value) ? value[0] : value;
  const end = Array.isArray(value) ? value[1] : null;

  return buildYearGrid(viewDate).map((year) => {
    const current = viewDate.year(year);
    const info: PickerCellRenderInfo = {
      date: current,
      text: String(year),
      type: pickerMode,
      selected: (!!start && current.isSame(start, "year")) || (!!end && current.isSame(end, "year")),
      disabled: disabledDate?.(current, { from: start ?? undefined, type: "year" }) ?? false,
      today: false,
      inView: true,
      rangeStart: !!start && current.isSame(start, "year"),
      rangeEnd: !!end && current.isSame(end, "year"),
      rangeMiddle: !!start && !!end && current.isAfter(start, "year") && current.isBefore(end, "year"),
      onSelect: () => onSelect(current),
    };

    return { key: year, info };
  });
}

export function buildQuarterCellInfos(
  viewDate: dayjs.Dayjs,
  value: dayjs.Dayjs | RangeValue | null,
  hoverValue: dayjs.Dayjs | null | undefined,
  pickerMode: PickerMode,
  disabledDate: ((current: dayjs.Dayjs, info: { from?: dayjs.Dayjs; type: PickerMode }) => boolean) | undefined,
  onSelect: (date: dayjs.Dayjs) => void,
) {
  const start = Array.isArray(value) ? value[0] : value;
  const end = Array.isArray(value) ? value[1] : null;

  return buildQuarterGrid().map((quarter) => {
    const current = viewDate.quarter(quarter);
    const info: PickerCellRenderInfo = {
      date: current,
      text: QUARTERS[quarter - 1],
      type: pickerMode,
      selected: !!start && sameQuarter(current, start),
      disabled: disabledDate?.(current, { from: start ?? undefined, type: "quarter" }) ?? false,
      today: false,
      inView: true,
      rangeStart: !!start && sameQuarter(current, start),
      rangeEnd: !!end && sameQuarter(current, end),
      rangeMiddle: !!start && !!end && current.isAfter(start, "quarter") && current.isBefore(end, "quarter"),
      hover: !!hoverValue && sameQuarter(current, hoverValue),
      onSelect: () => onSelect(current),
    };

    return { key: quarter, info, current };
  });
}
