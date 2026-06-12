import { Button } from "@rap/components-ui/button";
import { cn } from "@rap/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { ReactNode } from "react";
import type { PickerPanelMode } from "./types";

interface PickerHeaderProps {
  panelMode: PickerPanelMode;
  yearLabel: ReactNode;
  monthLabel?: ReactNode;
  rangeLabel?: ReactNode;
  onPrev: () => void;
  onNext: () => void;
  onDoublePrev?: () => void;
  onDoubleNext?: () => void;
  onYearClick?: () => void;
  onMonthClick?: () => void;
  className?: string;
}

function PickerHeader(props: PickerHeaderProps) {
  const {
    panelMode,
    yearLabel,
    monthLabel,
    rangeLabel,
    onPrev,
    onNext,
    onDoublePrev,
    onDoubleNext,
    onYearClick,
    onMonthClick,
    className,
  } = props;

  const showSingleArrows = panelMode === "date";
  const title =
    panelMode === "year" ? (
      <span>{rangeLabel}</span>
    ) : panelMode === "date" ? (
      <span className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 cursor-pointer px-1.5"
          onClick={onYearClick}
        >
          {yearLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 cursor-pointer px-1.5"
          onClick={onMonthClick}
        >
          {monthLabel}
        </Button>
      </span>
    ) : (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 cursor-pointer px-1.5"
        onClick={onYearClick}
      >
        {yearLabel}
      </Button>
    );

  return (
    <div className={cn("flex items-center justify-between border-b px-2 py-2", className)}>
      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon-sm" onClick={onDoublePrev}>
          <ChevronsLeft className="size-4" />
        </Button>
        {showSingleArrows ? (
          <Button type="button" variant="ghost" size="icon-sm" onClick={onPrev}>
            <ChevronLeft className="size-4" />
          </Button>
        ) : null}
      </div>
      <div className="flex items-center justify-center text-sm font-medium">{title}</div>
      <div className="flex items-center gap-1">
        {showSingleArrows ? (
          <Button type="button" variant="ghost" size="icon-sm" onClick={onNext}>
            <ChevronRight className="size-4" />
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="icon-sm" onClick={onDoubleNext}>
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export { PickerHeader };
