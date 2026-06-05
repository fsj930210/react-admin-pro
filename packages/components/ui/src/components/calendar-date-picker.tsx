"use client";

import * as React from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { type DateRange } from "react-day-picker";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@rap/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Calendar } from "./calendar";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const multiSelectVariants = cva(
  "flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground text-background",
        link: " underline-offset-4 hover:underline text-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface CalendarDatePickerProps
  extends React.HTMLAttributes<HTMLButtonElement>, VariantProps<typeof multiSelectVariants> {
  id?: string;
  className?: string;
  date: DateRange;
  closeOnSelect?: boolean;
  numberOfMonths?: 1 | 2;
  yearsRange?: number;
  onDateSelect: (range: { from: Date; to: Date }) => void;
}

export const CalendarDatePicker = React.forwardRef<HTMLButtonElement, CalendarDatePickerProps>(
  (
    {
      id = "calendar-date-picker",
      className,
      date,
      closeOnSelect = false,
      numberOfMonths = 2,
      yearsRange = 10,
      onDateSelect,
      variant,
      ...props
    },
    ref
  ) => {
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [selectedRange, setSelectedRange] = React.useState<string | null>(
      numberOfMonths === 2 ? "This Year" : "Today"
    );
    const [monthFrom, setMonthFrom] = React.useState<Date | undefined>(date?.from);
    const [yearFrom, setYearFrom] = React.useState<number | undefined>(date?.from?.getFullYear());
    const [monthTo, setMonthTo] = React.useState<Date | undefined>(
      numberOfMonths === 2 ? date?.to : date?.from
    );
    const [yearTo, setYearTo] = React.useState<number | undefined>(
      numberOfMonths === 2 ? date?.to?.getFullYear() : date?.from?.getFullYear()
    );
    const [highlightedPart, setHighlightedPart] = React.useState<string | null>(null);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const startOfDay = (date: Date) => dayjs(date).tz(timeZone).startOf("day").toDate();
    const endOfDay = (date: Date) => dayjs(date).tz(timeZone).endOf("day").toDate();
    const startOfMonth = (date: Date) => dayjs(date).tz(timeZone).startOf("month").toDate();
    const endOfMonth = (date: Date) => dayjs(date).tz(timeZone).endOf("month").toDate();
    const startOfYear = (date: Date) => dayjs(date).tz(timeZone).startOf("year").toDate();
    const endOfYear = (date: Date) => dayjs(date).tz(timeZone).endOf("year").toDate();
    const startOfIsoWeek = (date: Date) => dayjs(date).tz(timeZone).startOf("isoWeek").toDate();
    const endOfIsoWeek = (date: Date) => dayjs(date).tz(timeZone).endOf("isoWeek").toDate();
    const subDays = (date: Date, amount: number) =>
      dayjs(date).tz(timeZone).subtract(amount, "day").toDate();
    const formatWithTz = (date: Date, fmt: string) => dayjs(date).tz(timeZone).format(fmt);

    const handleClose = () => setIsPopoverOpen(false);

    const handleTogglePopover = () => setIsPopoverOpen((prev) => !prev);

    const selectDateRange = (from: Date, to: Date, range: string) => {
      const startDate = startOfDay(from);
      const endDate = numberOfMonths === 2 ? endOfDay(to) : startDate;
      onDateSelect({ from: startDate, to: endDate });
      setSelectedRange(range);
      setMonthFrom(from);
      setYearFrom(from.getFullYear());
      setMonthTo(to);
      setYearTo(to.getFullYear());
      if (closeOnSelect) {
        setIsPopoverOpen(false);
      }
    };

    const handleDateSelect = (range: DateRange | undefined) => {
      if (range) {
        let from = startOfDay(range.from as Date);
        let to = range.to ? endOfDay(range.to) : from;
        if (numberOfMonths === 1) {
          if (range.from !== date.from) {
            to = from;
          } else {
            from = startOfDay(range.to as Date);
          }
        }
        onDateSelect({ from, to });
        setMonthFrom(from);
        setYearFrom(from.getFullYear());
        setMonthTo(to);
        setYearTo(to.getFullYear());
      }
      setSelectedRange(null);
    };

    const handleMonthChange = (newMonthIndex: number, part: string) => {
      setSelectedRange(null);
      if (part === "from") {
        if (yearFrom !== undefined) {
          if (newMonthIndex < 0 || newMonthIndex > yearsRange + 1) return;
          const newMonth = new Date(yearFrom, newMonthIndex, 1);
          const from =
            numberOfMonths === 2
              ? startOfMonth(newMonth)
              : date?.from
                ? new Date(date.from.getFullYear(), newMonth.getMonth(), date.from.getDate())
                : newMonth;
          const to =
            numberOfMonths === 2 ? (date.to ? endOfDay(date.to) : endOfMonth(newMonth)) : from;
          if (from <= to) {
            onDateSelect({ from, to });
            setMonthFrom(newMonth);
            setMonthTo(date.to);
          }
        }
      } else {
        if (yearTo !== undefined) {
          if (newMonthIndex < 0 || newMonthIndex > yearsRange + 1) return;
          const newMonth = new Date(yearTo, newMonthIndex, 1);
          const from = date.from ? startOfDay(date.from) : startOfMonth(newMonth);
          const to = numberOfMonths === 2 ? endOfMonth(newMonth) : from;
          if (from <= to) {
            onDateSelect({ from, to });
            setMonthTo(newMonth);
            setMonthFrom(date.from);
          }
        }
      }
    };

    const handleYearChange = (newYear: number, part: string) => {
      setSelectedRange(null);
      if (part === "from") {
        if (years.includes(newYear)) {
          const newMonth = monthFrom
            ? new Date(newYear, monthFrom ? monthFrom.getMonth() : 0, 1)
            : new Date(newYear, 0, 1);
          const from =
            numberOfMonths === 2
              ? startOfMonth(newMonth)
              : date.from
                ? new Date(newYear, newMonth.getMonth(), date.from.getDate())
                : newMonth;
          const to =
            numberOfMonths === 2 ? (date.to ? endOfDay(date.to) : endOfMonth(newMonth)) : from;
          if (from <= to) {
            onDateSelect({ from, to });
            setYearFrom(newYear);
            setMonthFrom(newMonth);
            setYearTo(date.to?.getFullYear());
            setMonthTo(date.to);
          }
        }
      } else {
        if (years.includes(newYear)) {
          const newMonth = monthTo
            ? new Date(newYear, monthTo.getMonth(), 1)
            : new Date(newYear, 0, 1);
          const from = date.from ? startOfDay(date.from) : startOfMonth(newMonth);
          const to = numberOfMonths === 2 ? endOfMonth(newMonth) : from;
          if (from <= to) {
            onDateSelect({ from, to });
            setYearTo(newYear);
            setMonthTo(newMonth);
            setYearFrom(date.from?.getFullYear());
            setMonthFrom(date.from);
          }
        }
      }
    };

    const today = new Date();

    const years = Array.from(
      { length: yearsRange + 1 },
      (_, i) => today.getFullYear() - yearsRange / 2 + i
    );

    const dateRanges = [
      { label: "Today", start: today, end: today },
      { label: "Yesterday", start: subDays(today, 1), end: subDays(today, 1) },
      {
        label: "This Week",
        start: startOfIsoWeek(today),
        end: endOfIsoWeek(today),
      },
      {
        label: "Last Week",
        start: subDays(startOfIsoWeek(today), 7),
        end: subDays(endOfIsoWeek(today), 7),
      },
      { label: "Last 7 Days", start: subDays(today, 6), end: today },
      {
        label: "This Month",
        start: startOfMonth(today),
        end: endOfMonth(today),
      },
      {
        label: "Last Month",
        start: startOfMonth(subDays(today, today.getDate())),
        end: endOfMonth(subDays(today, today.getDate())),
      },
      { label: "This Year", start: startOfYear(today), end: endOfYear(today) },
      {
        label: "Last Year",
        start: startOfYear(subDays(today, 365)),
        end: endOfYear(subDays(today, 365)),
      },
    ];

    const handleMouseOver = (part: string) => {
      setHighlightedPart(part);
    };

    const handleMouseLeave = () => {
      setHighlightedPart(null);
    };

    const handleWheel = (event: React.WheelEvent) => {
      event.preventDefault();
      setSelectedRange(null);
      if (highlightedPart === "firstDay") {
        const newDate = new Date(date.from as Date);
        const increment = event.deltaY > 0 ? -1 : 1;
        newDate.setDate(newDate.getDate() + increment);
        if (newDate <= (date.to as Date)) {
          if (numberOfMonths === 2) {
            onDateSelect({ from: newDate, to: new Date(date.to as Date) });
          } else {
            onDateSelect({ from: newDate, to: newDate });
          }
          setMonthFrom(newDate);
        } else if (newDate > (date.to as Date) && numberOfMonths === 1) {
          onDateSelect({ from: newDate, to: newDate });
          setMonthFrom(newDate);
        }
      } else if (highlightedPart === "firstMonth") {
        const currentMonth = monthFrom ? monthFrom.getMonth() : 0;
        const newMonthIndex = currentMonth + (event.deltaY > 0 ? -1 : 1);
        handleMonthChange(newMonthIndex, "from");
      } else if (highlightedPart === "firstYear" && yearFrom !== undefined) {
        const newYear = yearFrom + (event.deltaY > 0 ? -1 : 1);
        handleYearChange(newYear, "from");
      } else if (highlightedPart === "secondDay") {
        const newDate = new Date(date.to as Date);
        const increment = event.deltaY > 0 ? -1 : 1;
        newDate.setDate(newDate.getDate() + increment);
        if (newDate >= (date.from as Date)) {
          onDateSelect({ from: new Date(date.from as Date), to: newDate });
          setMonthTo(newDate);
        }
      } else if (highlightedPart === "secondMonth") {
        const currentMonth = monthTo ? monthTo.getMonth() : 0;
        const newMonthIndex = currentMonth + (event.deltaY > 0 ? -1 : 1);
        handleMonthChange(newMonthIndex, "to");
      } else if (highlightedPart === "secondYear" && yearTo !== undefined) {
        const newYear = yearTo + (event.deltaY > 0 ? -1 : 1);
        handleYearChange(newYear, "to");
      }
    };

    React.useEffect(() => {
      const firstDayElement = document.getElementById(`firstDay-${id}`);
      const firstMonthElement = document.getElementById(`firstMonth-${id}`);
      const firstYearElement = document.getElementById(`firstYear-${id}`);
      const secondDayElement = document.getElementById(`secondDay-${id}`);
      const secondMonthElement = document.getElementById(`secondMonth-${id}`);
      const secondYearElement = document.getElementById(`secondYear-${id}`);

      const elements = [
        firstDayElement,
        firstMonthElement,
        firstYearElement,
        secondDayElement,
        secondMonthElement,
        secondYearElement,
      ];

      const addPassiveEventListener = (element: HTMLElement | null) => {
        if (element) {
          element.addEventListener("wheel", handleWheel as unknown as EventListener, {
            passive: false,
          });
        }
      };

      elements.forEach(addPassiveEventListener);

      return () => {
        elements.forEach((element) => {
          if (element) {
            element.removeEventListener("wheel", handleWheel as unknown as EventListener);
          }
        });
      };
    }, [highlightedPart, date]);

    return (
      <>
        <style>
          {`
            .date-part {
              touch-action: none;
            }
          `}
        </style>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              ref={ref}
              {...props}
              className={cn("w-auto", multiSelectVariants({ variant, className }))}
              size="default"
              onClick={handleTogglePopover}
              suppressHydrationWarning
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>
                {date?.from ? (
                  date.to ? (
                    <>
                      <span
                        id={`firstDay-${id}`}
                        className={cn(
                          "date-part",
                          highlightedPart === "firstDay" && "underline font-bold"
                        )}
                        onMouseOver={() => handleMouseOver("firstDay")}
                        onMouseLeave={handleMouseLeave}
                      >
                        {formatWithTz(date.from, "DD")}
                      </span>{" "}
                      <span
                        id={`firstMonth-${id}`}
                        className={cn(
                          "date-part",
                          highlightedPart === "firstMonth" && "underline font-bold"
                        )}
                        onMouseOver={() => handleMouseOver("firstMonth")}
                        onMouseLeave={handleMouseLeave}
                      >
                        {formatWithTz(date.from, "MMM")}
                      </span>
                      ,{" "}
                      <span
                        id={`firstYear-${id}`}
                        className={cn(
                          "date-part",
                          highlightedPart === "firstYear" && "underline font-bold"
                        )}
                        onMouseOver={() => handleMouseOver("firstYear")}
                        onMouseLeave={handleMouseLeave}
                      >
                        {formatWithTz(date.from, "YYYY")}
                      </span>
                      {numberOfMonths === 2 && (
                        <>
                          {" - "}
                          <span
                            id={`secondDay-${id}`}
                            className={cn(
                              "date-part",
                              highlightedPart === "secondDay" && "underline font-bold"
                            )}
                            onMouseOver={() => handleMouseOver("secondDay")}
                            onMouseLeave={handleMouseLeave}
                          >
                            {formatWithTz(date.to, "DD")}
                          </span>{" "}
                          <span
                            id={`secondMonth-${id}`}
                            className={cn(
                              "date-part",
                              highlightedPart === "secondMonth" && "underline font-bold"
                            )}
                            onMouseOver={() => handleMouseOver("secondMonth")}
                            onMouseLeave={handleMouseLeave}
                          >
                            {formatWithTz(date.to, "MMM")}
                          </span>
                          ,{" "}
                          <span
                            id={`secondYear-${id}`}
                            className={cn(
                              "date-part",
                              highlightedPart === "secondYear" && "underline font-bold"
                            )}
                            onMouseOver={() => handleMouseOver("secondYear")}
                            onMouseLeave={handleMouseLeave}
                          >
                            {formatWithTz(date.to, "YYYY")}
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span
                        id="day"
                        className={cn(
                          "date-part",
                          highlightedPart === "day" && "underline font-bold"
                        )}
                        onMouseOver={() => handleMouseOver("day")}
                        onMouseLeave={handleMouseLeave}
                      >
                        {formatWithTz(date.from, "DD")}
                      </span>{" "}
                      <span
                        id="month"
                        className={cn(
                          "date-part",
                          highlightedPart === "month" && "underline font-bold"
                        )}
                        onMouseOver={() => handleMouseOver("month")}
                        onMouseLeave={handleMouseLeave}
                      >
                        {formatWithTz(date.from, "MMM")}
                      </span>
                      ,{" "}
                      <span
                        id="year"
                        className={cn(
                          "date-part",
                          highlightedPart === "year" && "underline font-bold"
                        )}
                        onMouseOver={() => handleMouseOver("year")}
                        onMouseLeave={handleMouseLeave}
                      >
                        {formatWithTz(date.from, "YYYY")}
                      </span>
                    </>
                  )
                ) : (
                  <span>Select a date</span>
                )}
              </span>
            </Button>
          </PopoverTrigger>
          {isPopoverOpen && (
            <PopoverContent
              className="w-auto"
              align="start"
              avoidCollisions={false}
              onInteractOutside={handleClose}
              onEscapeKeyDown={handleClose}
              style={{
                maxHeight: "var(--radix-popover-content-available-height)",
                overflowY: "auto",
              }}
            >
              <div className="flex">
                {numberOfMonths === 2 && (
                  <div className="flex flex-col gap-1 pr-4 text-left border-r border-foreground/10">
                    {dateRanges.map(({ label, start, end }) => (
                      <Button
                        key={label}
                        variant="ghost"
                        size="default"
                        className={cn(
                          "justify-start hover:bg-primary/90 hover:text-background",
                          selectedRange === label &&
                            "bg-primary text-background hover:bg-primary/90 hover:text-background"
                        )}
                        onClick={() => {
                          selectDateRange(start, end, label);
                          setMonthFrom(start);
                          setYearFrom(start.getFullYear());
                          setMonthTo(end);
                          setYearTo(end.getFullYear());
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2 ml-3">
                      <Select
                        onValueChange={(value) => {
                          handleMonthChange(months.indexOf(value), "from");
                          setSelectedRange(null);
                        }}
                        value={monthFrom ? months[monthFrom.getMonth()] : undefined}
                      >
                        <SelectTrigger className="w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month, idx) => (
                            <SelectItem key={idx} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={(value) => {
                          handleYearChange(Number(value), "from");
                          setSelectedRange(null);
                        }}
                        value={yearFrom ? yearFrom.toString() : undefined}
                      >
                        <SelectTrigger className="w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year, idx) => (
                            <SelectItem key={idx} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {numberOfMonths === 2 && (
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(value) => {
                            handleMonthChange(months.indexOf(value), "to");
                            setSelectedRange(null);
                          }}
                          value={monthTo ? months[monthTo.getMonth()] : undefined}
                        >
                          <SelectTrigger className="w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month, idx) => (
                              <SelectItem key={idx} value={month}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          onValueChange={(value) => {
                            handleYearChange(Number(value), "to");
                            setSelectedRange(null);
                          }}
                          value={yearTo ? yearTo.toString() : undefined}
                        >
                          <SelectTrigger className="w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year, idx) => (
                              <SelectItem key={idx} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="flex">
                    <Calendar
                      mode="range"
                      defaultMonth={monthFrom}
                      month={monthFrom}
                      onMonthChange={setMonthFrom}
                      selected={date}
                      onSelect={handleDateSelect}
                      numberOfMonths={numberOfMonths}
                      showOutsideDays={false}
                      className={className}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          )}
        </Popover>
      </>
    );
  }
);

CalendarDatePicker.displayName = "CalendarDatePicker";
