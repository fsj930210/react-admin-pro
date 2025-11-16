import { cn } from "@rap/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScrollButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  canScroll: boolean;
  direction: "left" | "right";
  className?: string;
  scroll: () => void;
}

export function ScrollButton({
  canScroll,
  direction,
  scroll,
  className,
}: ScrollButtonProps) {
  const LeftIcon = () => (
    <div className={cn("relative", { "animate-arrow-left": canScroll })}>
      <ChevronLeft className="size-4" />
      <ChevronLeft className="size-4 absolute top-0 left-2 opacity-30" />
      <ChevronLeft className="size-4 absolute top-0 left-4 opacity-20" />
    </div>
  );

  const RightIcon = () => (
    <div className={cn("relative", { "animate-arrow-right": canScroll })}>
      <ChevronRight className="size-4" />
      <ChevronRight className="size-4 absolute top-0 right-2 opacity-30" />
      <ChevronRight className="size-4 absolute top-0 right-4 opacity-20" />
    </div>
  );

  return (
    <button
      type="button"
      onClick={scroll}
      disabled={!canScroll}
      className={cn(
        "h-full w-9 flex-items-center bg-layout-tabs/90 hover:bg-layout-tabs transition-all duration-200",
        {
          "opacity-50 cursor-not-allowed": !canScroll,
          "shadow-md hover:shadow-lg": canScroll, // 只有可滚动时才有阴影
          "border-l-layout-tabs-border border-l justify-end":
            direction === "right",
          "border-r-layout-tabs-border border-r": direction === "left",
        },
        className
      )}
    >
      {direction === "left" ? <LeftIcon /> : <RightIcon />}
    </button>
  );
}
