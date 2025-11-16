import { cn } from "@rap/utils";
import { X } from "lucide-react";
import type { LayoutTabItemProps } from "../../types";

export function CardTabItem({ tab, active, onClose }: LayoutTabItemProps) {
  return (
    <div className="h-full py-1">
      <div
        className={cn(
          "relative h-full flex items-center justify-between px-2 cursor-pointer",
          "rounded border border-layout-tabs-border bg-layout-tabs text-layout-tabs-foreground",
          "transition-all duration-200 ease-in-out",
          {
            "bg-layout-tabs-primary text-layout-tabs-primary-foreground border-layout-tabs-primary":
              active,
            "hover:bg-layout-tabs-accent": !active,
          }
        )}
        role="tab"
        tabIndex={0}
      >
        <span
          className="flex-1 truncate text-sm text-left pr-4"
          title={tab.title || ""}
        >
          {tab.title}
        </span>
        <button
          className="flex-center size-5 hover:bg-layout-tabs-close-accent rounded-xs cursor-pointer transition-all duration-200 ease-in-out group-[.active]:opacity-100 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.(tab.key);
          }}
          type="button"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
