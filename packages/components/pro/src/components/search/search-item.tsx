import { cn } from "@rap/utils";

import type { SearchItemProps } from "./types";

export function SearchItem({ className, ...props }: SearchItemProps) {
  return (
    <div
      {...props}
      data-search-item
      className={cn(
        "min-w-0 [&>[data-slot=field]]:w-full sm:[&>[data-slot=field]]:grid-cols-[var(--search-label-width)_minmax(0,1fr)]",
        className
      )}
    />
  );
}
