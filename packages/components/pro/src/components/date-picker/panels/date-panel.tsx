import { cn } from "@rap/utils";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { WEEKDAYS } from "../constants";
import { PickerCell } from "../picker-cell";
import type { Dayjs, PickerCellRenderInfo, PickerMode, RangeValue } from "../types";
import { buildDateGrid, sameDay } from "../utils";

interface DatePanelProps {
  pickerMode: PickerMode;
  viewDate: Dayjs;
  value: Dayjs | RangeValue | null;
  hoverValue?: Dayjs | null;
  disabledDate?: (current: Dayjs, info: { from?: Dayjs; type: PickerMode }) => boolean;
  renderCell?: (info: PickerCellRenderInfo) => ReactNode;
  onSelect: (date: Dayjs) => void;
  onHover?: (date: Dayjs | null) => void;
  className?: string;
}

function DatePanel(props: DatePanelProps) {
  const { pickerMode, viewDate, value, hoverValue, disabledDate, renderCell, onSelect, onHover, className } = props;
  const start = Array.isArray(value) ? value[0] : value;
  const end = Array.isArray(value) ? value[1] : null;
  const grid = buildDateGrid(viewDate);
  const hoverStart = start && !end ? start.startOf("day") : null;
  const hoverEnd = hoverValue && hoverStart ? hoverValue.startOf("day") : null;
  const hoveredWeekStart = pickerMode === "week" && hoverValue ? hoverValue.startOf("isoWeek") : null;
  const hoveredWeekEnd = pickerMode === "week" && hoverValue ? hoverValue.endOf("isoWeek") : null;
  const selectedWeekStart = pickerMode === "week" && start ? start.startOf("isoWeek") : null;
  const selectedWeekEnd = pickerMode === "week" && start ? start.endOf("isoWeek") : null;
  const rangeWeekStart = pickerMode === "week" && start ? start.startOf("isoWeek") : null;
  const rangeWeekEnd = pickerMode === "week" && end ? end.endOf("isoWeek") : null;

  return (
    <div className={cn("p-3", className)}>
      <div className="mb-2 grid grid-cols-7 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((item) => (
          <div key={item} className="py-1">
            {item}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {grid.map((current) => {
          const selected = !!start && sameDay(current, start);
          const selectedEnd = !!end && sameDay(current, end);
          const disabled = disabledDate?.(current, { from: start ?? undefined, type: "date" }) ?? false;
          const inView = current.month() === viewDate.month();
          const isToday = current.isSame(dayjs(), "day");
          const rangeStart = !!start && sameDay(current, start);
          const rangeEnd = !!end && sameDay(current, end);
          const hover =
            !!hoverStart &&
            !!hoverEnd &&
            ((hoverStart.isBefore(hoverEnd) &&
              current.isAfter(hoverStart, "day") &&
              (current.isBefore(hoverEnd, "day") || current.isSame(hoverEnd, "day"))) ||
              (hoverStart.isAfter(hoverEnd) &&
                (current.isAfter(hoverEnd, "day") || current.isSame(hoverEnd, "day")) &&
                current.isBefore(hoverStart, "day")));
          const rangeMiddle =
            pickerMode === "week"
              ? !!rangeWeekStart &&
                !!rangeWeekEnd &&
                (current.isSame(rangeWeekStart, "day") ||
                  current.isSame(rangeWeekEnd, "day") ||
                  (current.isAfter(rangeWeekStart, "day") && current.isBefore(rangeWeekEnd, "day")))
              : !!start && !!end && current.isAfter(start, "day") && current.isBefore(end, "day");
          const weekSelected =
            pickerMode === "week" &&
            !!selectedWeekStart &&
            !!selectedWeekEnd &&
            (current.isSame(selectedWeekStart, "day") ||
              current.isSame(selectedWeekEnd, "day") ||
              (current.isAfter(selectedWeekStart, "day") && current.isBefore(selectedWeekEnd, "day")));
          const weekHover =
            pickerMode === "week" &&
            !!hoveredWeekStart &&
            !!hoveredWeekEnd &&
            (current.isSame(hoveredWeekStart, "day") ||
              current.isSame(hoveredWeekEnd, "day") ||
              (current.isAfter(hoveredWeekStart, "day") && current.isBefore(hoveredWeekEnd, "day")));
          const weekRangeStart = pickerMode === "week" && !!rangeWeekStart ? sameDay(current, rangeWeekStart) : rangeStart;
          const weekRangeEnd = pickerMode === "week" && !!rangeWeekEnd ? sameDay(current, rangeWeekEnd) : rangeEnd;
          const weekHighlight = weekHover || weekSelected;
          const weekHighlightStart =
            pickerMode === "week" &&
            ((!!hoveredWeekStart && sameDay(current, hoveredWeekStart)) ||
              (!!selectedWeekStart && sameDay(current, selectedWeekStart)));
          const weekHighlightEnd =
            pickerMode === "week" &&
            ((!!hoveredWeekEnd && sameDay(current, hoveredWeekEnd)) ||
              (!!selectedWeekEnd && sameDay(current, selectedWeekEnd)));
          const info: PickerCellRenderInfo = {
            date: current,
            text: String(current.date()),
            type: pickerMode,
            selected: selected || selectedEnd,
            disabled,
            today: isToday,
            inView,
            rangeStart: weekRangeStart,
            rangeEnd: weekRangeEnd,
            rangeMiddle,
            hover,
            onSelect: () => onSelect(current),
          };

          return (
            <div
              key={current.format("YYYY-MM-DD")}
              className={cn(
                "relative flex items-center justify-center px-[2px] py-[2px]",
                weekHighlight && "bg-primary px-0",
                weekHighlightStart && "rounded-l-md",
                weekHighlightEnd && "rounded-r-md",
                rangeMiddle && !weekHighlight && "bg-accent/70",
                hover && !rangeMiddle && !weekHighlight && "bg-accent/50",
                (rangeStart || weekRangeStart) &&
                  (end || hoverValue) &&
                  !weekHighlight &&
                  "after:absolute after:inset-y-[2px] after:right-0 after:w-1/2 after:bg-accent/70",
                (rangeEnd || weekRangeEnd) &&
                  start &&
                  !weekHighlight &&
                  "before:absolute before:inset-y-[2px] before:left-0 before:w-1/2 before:bg-accent/70",
                hoverStart &&
                  hoverEnd &&
                  sameDay(current, hoverEnd) &&
                  !weekHighlight &&
                  "before:absolute before:inset-y-[2px] before:left-0 before:w-1/2 before:bg-accent/50",
              )}
              onMouseEnter={() => onHover?.(current)}
              onMouseLeave={() => onHover?.(null)}
            >
              {renderCell ? (
                renderCell(info)
              ) : (
                <PickerCell
                  info={info}
                  className={cn(
                    "relative z-10 h-9",
                    !inView && "text-muted-foreground/40",
                    weekHighlight &&
                      "rounded-none border-transparent bg-transparent text-primary-foreground hover:bg-transparent hover:text-primary-foreground",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { DatePanel };
