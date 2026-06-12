import { Button } from "@rap/components-ui/button";
import { cn } from "@rap/utils";
import type { PickerCellRenderInfo } from "./types";

interface PickerCellProps {
  info: PickerCellRenderInfo;
  className?: string;
}

function PickerCell(props: PickerCellProps) {
  const { info, className } = props;
  const isRangeEdge = info.rangeStart || info.rangeEnd;
  const isStrongSelected = info.selected || isRangeEdge;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={info.disabled}
      data-selected={info.selected}
      data-disabled={info.disabled}
      data-today={info.today}
      data-range-start={info.rangeStart}
      data-range-end={info.rangeEnd}
      data-range-middle={info.rangeMiddle}
      className={cn(
        "h-8 w-full cursor-pointer rounded-md border border-transparent bg-transparent px-0 py-0 text-sm font-normal shadow-none ring-0",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40",
        info.disabled && "cursor-not-allowed text-muted-foreground/40 hover:bg-transparent hover:text-muted-foreground/40",
        info.rangeMiddle && "rounded-none border-transparent bg-accent/70 text-foreground hover:bg-accent/70",
        isStrongSelected && "rounded-md border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        info.rangeStart && "rounded-l-md rounded-r-none",
        info.rangeEnd && "rounded-r-md rounded-l-none",
        info.today && !isStrongSelected && !info.rangeMiddle && "border-primary/70 text-primary",
        className,
      )}
      onClick={info.onSelect}
    >
      {info.text}
    </Button>
  );
}

export { PickerCell };
