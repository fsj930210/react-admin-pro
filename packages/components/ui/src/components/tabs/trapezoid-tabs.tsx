import { X } from "lucide-react";
import type { LayoutTabItemProps } from "./types";
import { cn } from "@rap/utils";

export function TrapezoidTabs({ tab }: LayoutTabItemProps) {
  return (
    <li key={tab.value} className="h-full pt-1">
      <div className={cn("group relative flex-center h-full w-40 hover:not-[.active]:after:border-b-layout-tabs-accent", {
        "after:absolute after:top-0 after:left-0 after:w-full after:h-0 after:z-1 after:border-l-[16px] after:border-l-transparent after:transition-all after:duration-200 after:ease-in-out": true,
        "after:border-r-[16px] after:border-r-transparent after:border-b-[35px] after:border-b-layout-tabs-border": true,
        'active after:border-b-layout-tabs-primary': tab.value === "settings",
      })}>

        <span className="relative w-30 text-center z-2 truncate text-sm cursor-pointer" title={tab.label || ""}>
          {tab.label}
        </span>
        <div className="relative flex-center size-4 z-2 opacity-0 hover:bg-layout-tabs-close-accent rounded-full cursor-pointer transition-all duration-200 esae-in-out group-hover:opacity-100">
          <X className="size-3.5" />
        </div>
      </div>
    </li>
  );
}