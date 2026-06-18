import { cn } from "@rap/utils";

import type { SearchItemProps } from "./types";

export function SearchItem({ className, span = 1, style, ...props }: SearchItemProps) {
  return (
    <div
      {...props}
      data-search-item
      className={cn("min-w-0 shrink", className)}
      style={{
        flexBasis: `calc(var(--search-item-flex-width, var(--search-item-width)) * ${Math.max(span, 1)})`,
        flexGrow: 0,
        ...style,
      }}
    />
  );
}
